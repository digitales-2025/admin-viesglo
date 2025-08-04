import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

// Schema para contactos (sin isActive en el formulario)
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  position: z
    .string()
    .min(2, "El cargo debe tener al menos 2 caracteres")
    .max(50, "El cargo no puede tener más de 50 caracteres"),
  phone: z
    .string()
    .min(6, "El teléfono debe tener al menos 6 caracteres")
    .max(20, "El teléfono no puede tener más de 20 caracteres")
    .refine(isValidPhoneNumber, "El teléfono debe tener un formato internacional válido"),
  email: z.string().email("Debe ser un email válido"),
});

// Schema para dirección de cliente (sin isActive en el formulario)
export const clientAddressSchema = z.object({
  address: z.string().min(1, "La dirección es requerida"),
  reference: z.string().max(255, "La referencia no puede tener más de 255 caracteres").optional().or(z.literal("")), // Permite string vacío como opcional
});

// Schema para información SUNAT
const sunatInfoSchema = z.object({
  address: z.string().min(1, "La dirección es requerida"),
  fullAddress: z.string().min(1, "La dirección completa es requerida"),
  businessName: z.string().min(1, "La razón social es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  condition: z.string().min(1, "La condición es requerida"),
  department: z.string().min(1, "El departamento es requerido"),
  province: z.string().min(1, "La provincia es requerida"),
  district: z.string().min(1, "El distrito es requerido"),
});

// Schema principal para crear cliente (sin isActive)
export const createClientSchema = z.object({
  ruc: z
    .string()
    .min(11, "El RUC debe tener 11 caracteres")
    .max(11, "El RUC debe tener 11 caracteres")
    .regex(/^\d{11}$/, "El RUC debe contener solo números"),
  name: z
    .string()
    .min(2, "La razón social debe tener al menos 2 caracteres")
    .max(100, "La razón social no puede tener más de 100 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  legalRepresentative: z
    .string()
    .min(2, "El representante legal debe tener al menos 2 caracteres")
    .max(100, "El representante legal no puede tener más de 100 caracteres"),
  contacts: z.array(contactSchema).optional().default([]),
  addresses: z.array(clientAddressSchema).optional().default([]),
  sunatInfo: sunatInfoSchema.optional(),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ClientAddressFormData = z.infer<typeof clientAddressSchema>;
