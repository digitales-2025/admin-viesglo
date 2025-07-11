import { components } from "@/lib/api/types/api";

export type SignInDto = components["schemas"]["SignInDto"];
export type SignInResponseDto = components["schemas"]["UserResponseDto"];

export type Credentials = {
  email: string;
  password: string;
};
