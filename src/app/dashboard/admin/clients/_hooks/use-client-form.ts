"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CreateClientFormData, createClientSchema } from "../_schemas/clients.schemas";
import { ClientContactResponseDto, ClientOperationResponseDto } from "../_types/clients.types";
import { useCreateClient, useUpdateClient } from "./use-clients";

interface UseClientFormProps {
  isUpdate?: boolean;
  initialData?: ClientOperationResponseDto;
  onSuccess?: () => void;
}

export function useClientForm({ isUpdate = false, initialData, onSuccess }: UseClientFormProps) {
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const isPending = isCreating || isUpdating;
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
  }, [initialData]);

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

  // Nueva función onSubmit
  const onSubmit = (data: CreateClientFormData) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      updateClient(
        {
          params: { path: { id: initialData.id } },
          body: submitData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    } else {
      createClient(
        { body: submitData },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    }
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
    isPending,
    onSubmit,
  };
}
