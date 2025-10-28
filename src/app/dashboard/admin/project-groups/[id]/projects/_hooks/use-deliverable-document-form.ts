"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { DeliverableDocumentForm, deliverableDocumentSchema } from "../_schemas/deliverable-documents.schemas";
import { DeliverableDocumentDto } from "../_types";
import { useAddDocumentToDeliverable, useUpdateDocument } from "./use-project-deliverable-documents";

interface UseDeliverableDocumentFormProps {
  isUpdate?: boolean;
  initialData?: DeliverableDocumentDto;
  projectId: string;
  phaseId: string;
  deliverableId: string;
  onSuccess?: () => void;
}

export function useDeliverableDocumentForm({
  isUpdate = false,
  initialData,
  projectId,
  phaseId,
  deliverableId,
  onSuccess,
}: UseDeliverableDocumentFormProps) {
  const { mutate: addDocument, isPending: isCreating } = useAddDocumentToDeliverable();
  const { mutate: updateDocument, isPending: isUpdating } = useUpdateDocument();
  const isPending = isCreating || isUpdating;

  const form = useForm<DeliverableDocumentForm>({
    resolver: zodResolver(deliverableDocumentSchema),
    defaultValues: {
      fileName: "",
      fileUrl: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        fileName: initialData.fileName || "",
        fileUrl: initialData.fileUrl || "",
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: DeliverableDocumentForm) => {
    return {
      ...data,
      // Si es actualización, mantener algunos valores del initialData
      ...(isUpdate &&
        initialData &&
        {
          // Aquí puedes agregar campos que se mantengan en la actualización
        }),
    };
  };

  // Función onSubmit
  const onSubmit = (data: DeliverableDocumentForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData && initialData.id) {
      updateDocument(
        {
          params: {
            path: {
              projectId,
              phaseId,
              deliverableId,
              documentId: initialData.id,
            },
          },
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
      addDocument(
        {
          params: {
            path: {
              projectId,
              phaseId,
              deliverableId,
            },
          },
          body: submitData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    }
  };

  return {
    form,
    isUpdate,
    onSuccess,
    getSubmitData,
    isPending,
    onSubmit,
  };
}
