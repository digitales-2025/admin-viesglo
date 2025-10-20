"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AdditionalDocumentForm, additionalDocumentSchema } from "../_schemas/additional-documents.schemas";
import { AdditionalDocumentDetailedDto } from "../_types";
import {
  useAddDocumentToAdditionalDeliverable,
  useUpdateAdditionalDocument,
} from "./use-additional-deliverable-documents";

interface UseAdditionalDocumentFormProps {
  isUpdate?: boolean;
  initialData?: AdditionalDocumentDetailedDto;
  projectId: string;
  phaseId: string;
  additionalDeliverableId: string;
  onSuccess?: () => void;
}

export function useAdditionalDocumentForm({
  isUpdate = false,
  initialData,
  projectId,
  phaseId,
  additionalDeliverableId,
  onSuccess,
}: UseAdditionalDocumentFormProps) {
  const { mutate: addDocument, isPending: isCreating } = useAddDocumentToAdditionalDeliverable();
  const { mutate: updateDocument, isPending: isUpdating } = useUpdateAdditionalDocument();
  const isPending = isCreating || isUpdating;

  const form = useForm<AdditionalDocumentForm>({
    resolver: zodResolver(additionalDocumentSchema),
    defaultValues: {
      fileName: "",
      fileUrl: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        fileName: (initialData.fileName as unknown as string) || "",
        fileUrl: initialData.fileUrl || "",
        fileSize: (initialData.fileSize as unknown as number) || undefined,
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: AdditionalDocumentForm) => {
    // Para documentos adicionales, solo necesitamos fileUrl y fileName opcional
    const submitData: {
      fileUrl: string;
      fileName?: Record<string, never> | null;
      fileSize?: Record<string, never> | null;
    } = {
      fileUrl: data.fileUrl,
    };

    if (data.fileName && data.fileName.trim()) {
      submitData.fileName = data.fileName as any;
    }

    if (data.fileSize !== undefined) {
      submitData.fileSize = data.fileSize as any;
    }

    return submitData;
  };

  // Función onSubmit
  const onSubmit = (data: AdditionalDocumentForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData && initialData.id) {
      updateDocument(
        {
          params: {
            path: {
              projectId,
              phaseId,
              additionalDeliverableId,
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
              additionalDeliverableId,
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
