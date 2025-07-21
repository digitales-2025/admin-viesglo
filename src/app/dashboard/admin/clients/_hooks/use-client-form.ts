"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { ClientContactResponseDto, ClientOperationResponseDto } from "../_types/clients.types";

// Schema para contactos (sin isActive en el formulario)
const contactSchema = z.object({
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
  sunatInfo: sunatInfoSchema.optional(),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

interface UseClientFormProps {
  isUpdate?: boolean;
  initialData?: ClientOperationResponseDto;
  onSuccess?: () => void;
}

export function useClientForm({ isUpdate = false, initialData, onSuccess }: UseClientFormProps) {
  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      ruc: "",
      name: "",
      email: "",
      legalRepresentative: "",
      contacts: [],
      sunatInfo: {
        address: "",
        fullAddress: "",
        businessName: "",
        state: "",
        condition: "",
        department: "",
        province: "",
        district: "",
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        ruc: initialData._ruc.value || "",
        name: initialData.name || "",
        email: initialData._email.value || "",
        legalRepresentative: initialData.legalRepresentative || "",
        contacts:
          initialData.contacts?.map((contact: ClientContactResponseDto) => ({
            name: contact.name || "",
            position: contact.position || "",
            phone: contact._phone.value || "",
            email: contact._email.value || "",
          })) || [],
        sunatInfo: {
          address: initialData.sunatInfo?.address || "",
          fullAddress: initialData.sunatInfo?.fullAddress || "",
          businessName: initialData.sunatInfo?.businessName || "",
          state: initialData.sunatInfo?.state || "",
          condition: initialData.sunatInfo?.condition || "",
          department: initialData.sunatInfo?.department || "",
          province: initialData.sunatInfo?.province || "",
          district: initialData.sunatInfo?.district || "",
        },
      };
      form.reset(formData);
    }
  }, [initialData, form]);

  // Función para obtener los datos finales con isActive manejado automáticamente
  const getSubmitData = (data: CreateClientFormData) => {
    return {
      ...data,
      isActive: isUpdate ? (initialData?.isActive ?? true) : true,
      contacts:
        data.contacts?.map((contact, index) => ({
          ...contact,
          isActive: isUpdate ? (initialData?.contacts?.[index]?.isActive ?? true) : true,
        })) || [],
    };
  };

  const addContact = () => {
    const currentContacts = form.getValues("contacts") || [];
    form.setValue("contacts", [
      ...currentContacts,
      {
        name: "",
        position: "",
        phone: "",
        email: "",
      },
    ]);
  };

  const removeContact = (index: number) => {
    const currentContacts = form.getValues("contacts") || [];
    form.setValue(
      "contacts",
      currentContacts.filter((_, i) => i !== index)
    );
  };

  return {
    form,
    addContact,
    removeContact,
    isUpdate,
    onSuccess,
    getSubmitData,
  };
}
