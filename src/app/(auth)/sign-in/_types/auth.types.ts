import { components } from "@/lib/api/types/api";

export type AuthResponseOriginal = components["schemas"]["AuthResponseDto"];

export type AuthResponse = Omit<AuthResponseOriginal, "roles"> & {
  roles: string[];
};

export type SignIn = components["schemas"]["SignInDto"];

export type UpdatePassword = components["schemas"]["UpdatePasswordDto"];
