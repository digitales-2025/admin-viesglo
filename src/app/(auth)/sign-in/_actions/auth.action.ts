"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import { http } from "@/lib/http/clientFetch";
import { http as httpApi } from "@/lib/http/serverFetch";
import { AuthResponse } from "../_types/auth.types";
import { components } from "../../../../lib/api/types/api";

// Schema para validación del formulario
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type Credentials = components["schemas"]["SignInDto"];

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

    const { data: responseData, headers } = await http.post<AuthResponse>("/auth/login", loginData);

    // Log para ver la respuesta completa del servidor
    /* console.log("Respuesta completa del servidor:", responseData); */

    if (!responseData?.id) {
      return { error: "Credenciales inválidas" };
    }

    const cookieStore = await cookies();
    const setCookieHeaders = headers?.["set-cookie"] || [];

    // Log para ver las cookies recibidas
    /*  console.log("Headers de cookies recibidos:", setCookieHeaders); */

    // Primero eliminamos las cookies existentes
    cookieStore.delete("logged_in");
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    // Establecemos las nuevas cookies
    if (Array.isArray(setCookieHeaders)) {
      setCookieHeaders.forEach((cookie) => {
        // Extraemos el nombre y valor de la cookie
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        // Establecemos la cookie
        cookieStore.set(name, value, {
          httpOnly: cookie.includes("HttpOnly"),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      });
    }

    const allCookies = cookieStore.getAll();

    console.log("🔑 Todas las cookies establecidas:", allCookies);

    return { success: true, data: responseData };
  } catch (error: any) {
    console.error("❌ Error al iniciar sesión:", error);
    return { success: false, error: error.message || "Error al iniciar sesión" };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();

    // Eliminamos las cookies existentes
    cookieStore.delete("logged_in");
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    // Establecemos las cookies con fecha de expiración en el pasado
    cookieStore.set("logged_in", "", {
      expires: new Date(0),
      path: "/",
      sameSite: "strict",
    });

    cookieStore.set("access_token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });

    cookieStore.set("refresh_token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });

    return {
      success: true,
      redirect: "/sign-in",
    };
  } catch (error) {
    console.error("Error en logout:", error);
    return {
      success: false,
      error: "Error al cerrar sesión",
    };
  }
}

export async function currentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  try {
    const [data, error] = await httpApi.get<AuthResponse>("/auth/me");
    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return null;
  }
}
