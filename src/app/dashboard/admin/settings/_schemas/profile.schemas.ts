import { z } from "zod";

// Schemas de validación
export const userInfoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(250, "El nombre no puede exceder 250 caracteres"),
  lastName: z.string().min(1, "El apellido es requerido").max(250, "El apellido no puede exceder 250 caracteres"),
});

export const passwordSchema = z
  .object({
    current: z.string().min(1, "La contraseña actual es requerida"),
    new: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/\d/, "Debe contener al menos un número")
      .regex(/[!@#$%^&*()_,.?":{}|<>]/, "Debe contener al menos un carácter especial"),
    confirm: z.string(),
  })
  .refine((data) => data.new === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export type UserInfoForm = z.infer<typeof userInfoSchema>;
export type PasswordForm = z.infer<typeof passwordSchema>;
