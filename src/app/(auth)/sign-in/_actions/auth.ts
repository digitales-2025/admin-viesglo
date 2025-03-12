"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ENDPOINTS } from "@/lib/http/endpoints";
import { http } from "@/lib/http/methods";
import { components } from "../../../../lib/api/types/api";

// Schema para validación del formulario
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type Credentials = components["schemas"]["SignInDto"];

// Action para login
export async function login(credentials: Credentials) {
  // Validar datos
  const validationResult = loginSchema.safeParse(credentials);
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const loginData: Credentials = {
      email: credentials.email,
      password: credentials.password,
    };

    // Realizar petición al API
    // Use direct fetch for login to avoid token refresh mechanism
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${baseUrl}${ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      credentials: "include", // For HttpOnly cookies
    });
    console.log("🚀 ~ login ~ response:", response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error en inicio de sesión");
    }

    const result = await response.json();
    return {
      success: true,
      user: result.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Credenciales inválidas",
    };
  }
}

// Action para logout
export async function logout() {
  try {
    // Determinar si estamos en el servidor
    const isServer = typeof window === "undefined";
    console.log(`🔄 Ejecutando logout en el ${isServer ? "servidor" : "cliente"}`);

    // Obtener la URL completa
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const url = `${baseUrl}${ENDPOINTS.LOGOUT}`;

    try {
      // Intentar cerrar sesión en el backend
      console.log("📡 Enviando petición de logout al backend");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Para que funcione desde el cliente
      });

      if (response.ok) {
        console.log("✅ Logout exitoso en backend");
      } else {
        console.warn(`⚠️ El backend respondió con estado ${response.status}`);
      }
    } catch (error) {
      // Si hay error en el logout en el servidor, lo registramos pero continuamos
      console.error("❌ Error en logout del servidor:", error);
    }

    // No intentamos manipular cookies desde el servidor
    // El backend ya se encarga de invalidar las cookies

    // Redirigir al login
    console.log("🔀 Redirigiendo a login...");
    redirect("/sign-in");
  } catch (error: any) {
    console.error("❌ Error al cerrar sesión", error);
    return { success: false, error: "Error al cerrar sesión" };
  }
}

// Action para obtener el usuario actual
export async function currentUser() {
  try {
    // Determinar si estamos en el servidor o cliente
    const isServer = typeof window === "undefined";
    console.log(`📡 Ejecutando currentUser en el ${isServer ? "servidor" : "cliente"}`);

    // En el cliente, simplemente usamos http.get que ya maneja las cookies correctamente
    if (!isServer) {
      const result = await http.get(ENDPOINTS.ME);
      console.log("✅ /me exitoso en cliente:", result);
      return { success: true, user: result };
    }

    // En el servidor, necesitamos un enfoque más directo
    console.log("🔍 Ejecutando en servidor, obteniendo cookies explícitamente");

    // Obtener cookies de la solicitud (manejando caso de Promise)
    const cookieStore = await Promise.resolve(cookies());

    // Obtener tokens de autenticación
    const accessToken = cookieStore.get("access_token");
    const refreshToken = cookieStore.get("refresh_token");

    console.log("🔑 Tokens:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    // Construir el header Cookie para enviar al backend
    let cookieHeader = "";
    if (accessToken || refreshToken) {
      const parts = [];
      if (accessToken) parts.push(`access_token=${accessToken.value}`);
      if (refreshToken) parts.push(`refresh_token=${refreshToken.value}`);
      cookieHeader = parts.join("; ");
    }

    // Si no hay cookies, retornar error
    if (!cookieHeader) {
      console.warn("⚠️ No hay cookies de autenticación disponibles");
      return {
        success: false,
        error: "No hay cookies de autenticación",
      };
    }

    // Hacer la petición directamente con fetch
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${baseUrl}${ENDPOINTS.ME}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    // Procesar la respuesta
    if (!response.ok) {
      const status = response.status;
      console.error(`❌ Error HTTP ${status} en /me con cookies manuales`);

      // Si es error de autenticación y tenemos refresh token, intentar refresh
      if (status === 401 && refreshToken) {
        console.log("🔄 Intentando refresh token en servidor");

        // Intentar hacer refresh
        const refreshResponse = await fetch(`${baseUrl}${ENDPOINTS.REFRESH}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `refresh_token=${refreshToken.value}`,
          },
          credentials: "include",
        });

        // Si el refresh fue exitoso, obtener nuevo token y reintentar
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log("✅ Refresh en servidor exitoso, reintentando /me");

          // Actualizar header con nuevo access token
          const newCookieHeader = `access_token=${refreshData.accessToken}; refresh_token=${refreshToken.value}`;

          // Reintentar la petición original
          const retryResponse = await fetch(`${baseUrl}${ENDPOINTS.ME}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Cookie: newCookieHeader,
            },
            credentials: "include",
          });

          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            return { success: true, user: userData };
          }
        }
      }

      // Si no se pudo resolver, retornar error
      return {
        success: false,
        error: "Error de autenticación en el servidor",
        status: status,
      };
    }

    // Procesar respuesta exitosa
    const userData = await response.json();
    console.log("✅ /me exitoso en servidor con cookies manuales");
    return { success: true, user: userData };
  } catch (error: any) {
    console.error("❌ Error en currentUser:", error);
    return {
      success: false,
      error: error.message || "Error al obtener usuario",
      status: error.status,
    };
  }
}
