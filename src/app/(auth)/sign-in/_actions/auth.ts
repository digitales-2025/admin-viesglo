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

type Credentials = components["schemas"]["SignInDto"];

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
    // Guardamos el token en las cookies
    const cookieStore = await cookies();

    cookieStore.set("access_token", result.accessToken);
    cookieStore.set("refresh_token", result.refreshToken);

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
    await http.post(ENDPOINTS.LOGOUT);

    // Limpiar cookies
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
