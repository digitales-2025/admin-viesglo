import z from "zod";

import { Credentials } from "../../log-in/_types/login.types";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Ingrese su email",
    })
    .email({
      message: "Email no válido",
    }),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
}) satisfies z.ZodType<Credentials>;

export type LoginSchemaDto = z.infer<typeof loginSchema>;
