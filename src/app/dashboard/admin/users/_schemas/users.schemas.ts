import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Esquema para crear usuario
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede tener más de 50 caracteres"),
  email: z.string().email("Debe ser un email válido").min(1, "El email es requerido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no puede tener más de 128 caracteres")
    .regex(
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial"
    )
    .optional(),
  roleId: z.string().min(1, "El rol es requerido"),
});

// Esquema para actualizar usuario
export const updateUserSchema = createUserSchema.omit({
  email: true,
  password: true,
});

// Esquema para cambiar contraseña
export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .max(128, "La nueva contraseña no puede tener más de 128 caracteres")
      .regex(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        "La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial"
      ),
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Tipos de retorno para cada modo
export type UseUserFormReturn =
  | {
      form: UseFormReturn<CreateUserFormData>;
      isUpdate: false;
      isPending: boolean;
      onSubmit: (data: CreateUserFormData) => void;
      onSuccess?: () => void;
    }
  | {
      form: UseFormReturn<UpdateUserFormData>;
      isUpdate: true;
      isPending: boolean;
      onSubmit: (data: UpdateUserFormData) => void;
      onSuccess?: () => void;
    }
  | {
      form: UseFormReturn<ChangePasswordFormData>;
      isUpdate: true;
      isPending: boolean;
      onSubmit: (data: ChangePasswordFormData) => void;
      onSuccess?: () => void;
    };
