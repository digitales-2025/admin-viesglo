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
    const result = await http.post(ENDPOINTS.LOGIN, loginData);
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
// Añade esta nueva server action
export async function refreshToken() {
  try {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      throw new Error("No hay token de actualización");
    }
    await http.post(ENDPOINTS.REFRESH, { refreshToken });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al refrescar el token",
    };
  }
}
// Action para logout
export async function logout() {
  try {
    try {
      // Intentar cerrar sesión en el backend
      const result = await http.post(ENDPOINTS.LOGOUT);

      // Si fue exitoso, perfecto
      if (result.success) {
        console.log("Logout exitoso en backend");
      }
    } catch (error) {
      // Si hay error en el logout en el servidor, lo registramos pero continuamos
      // No queremos que un error del servidor impida al usuario cerrar sesión localmente
      console.error("Error en logout del servidor:", error);
    }

    // En cualquier caso, siempre limpiar cookies locales
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    // Redirigir al login
    redirect("/sign-in");
  } catch (error: any) {
    console.error("Error al cerrar sesión", error);
    return { success: false, error: "Error al cerrar sesión" };
  }
}
