"use server";

import { cookies } from "next/headers";
import { z } from "zod";

import { Permission } from "@/auth/domain/entities/Role";
import { getUserDashboardPath } from "@/auth/domain/entities/User";
import { http } from "@/lib/http/clientFetch";
import { http as httpApi } from "@/lib/http/serverFetch";
import { AuthResponse, SignIn, UpdatePassword } from "../_types/auth.types";

// Schema para validación del formulario
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

const API_ENDPOINT = "/auth";

export async function login(credentials: SignIn) {
  // Validar datos
  const validationResult = loginSchema.safeParse(credentials);
  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    const loginData: SignIn = {
      email: credentials.email,
      password: credentials.password,
    };

    const { data: responseData, headers } = await http.post<AuthResponse>(`${API_ENDPOINT}/login`, loginData);
    if (!responseData?.id) {
      return { error: "Credenciales inválidas" };
    }

    // Adaptar los roles si vienen como objetos complejos
    const adaptedData = {
      ...responseData,
      roles: Array.isArray(responseData.roles)
        ? responseData.roles.map((role: any) => (typeof role === "string" ? role : role.name))
        : [],
    };
    const cookieStore = await cookies();
    const setCookieHeaders = headers?.["set-cookie"] || [];

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

    // Calcular la ruta de redirección según el tipo de usuario
    const dashboardUrl = getUserDashboardPath();

    return {
      success: true,
      data: adaptedData,
      redirectUrl: dashboardUrl,
    };
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

    // Notificar al backend del logout para invalidar el token en el servidor
    try {
      await httpApi.post(`${API_ENDPOINT}/logout`);
    } catch (error) {
      console.error("Error al notificar logout al backend:", error);
      // Continuar con el logout local incluso si falla la notificación al backend
    }

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

export async function currentUser(): Promise<{ success: boolean; data: AuthResponse | null; error?: string }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Si no hay refresh_token, el usuario no está autenticado
  if (!refreshToken) {
    return { success: false, data: null };
  }

  try {
    // Llamamos a /auth/me, que verificará el access_token
    // Si está expirado, el backend lo renovará automáticamente usando el refresh_token
    const [data, error] = await httpApi.get<AuthResponse>(`${API_ENDPOINT}/me`, {
      // Asegurarnos de que se envían las cookies
      headers: {
        Cookie: `refresh_token=${refreshToken}${accessToken ? `; access_token=${accessToken}` : ""}`,
      },
    });
    if (error) {
      // Si hay un error en la respuesta de la API (401, 403, etc.)
      // consideramos que el usuario no está autenticado
      console.error("Error al obtener el usuario:", error);
      return { success: false, data: null };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error al obtener el usuario:", error);
    return { success: false, data: null, error: error.message || "Error al obtener el usuario" };
  }
}

export async function updatePassword(
  data: UpdatePassword
): Promise<{ success: boolean; data: string | null; error?: string }> {
  try {
    const [response, error] = await httpApi.put<string>(`${API_ENDPOINT}/update-password`, data);
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, data: null, error: error.message || "Error al actualizar la contraseña" };
  }
}

export async function getUserPermissions(): Promise<{ data: Permission[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await httpApi.get<Permission[]>(`${API_ENDPOINT}/permissions`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener permisos del usuario" };
    }
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Error al obtener permisos del usuario" };
  }
}
