"use client";

import React, { useState } from "react";
import { ExternalLink, FileText, Link, Loader2, Upload } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { useDeliverableDocumentForm } from "../../../../../_hooks/use-deliverable-document-form";
import { DeliverableDocumentDto } from "../../../../../_types";

interface DeliverableDocumentEditorFormProps {
  currentRow?: DeliverableDocumentDto;
  projectId: string;
  phaseId: string;
  deliverableId: string;
  onOpenChange: (open: boolean) => void;
}

export function DeliverableDocumentEditorForm({
  currentRow,
  projectId,
  phaseId,
  deliverableId,
  onOpenChange,
}: DeliverableDocumentEditorFormProps) {
  const isUpdate = !!currentRow;
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

  const { form, onSubmit, isPending } = useDeliverableDocumentForm({
    isUpdate,
    initialData: currentRow,
    projectId,
    phaseId,
    deliverableId,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const { watch } = form;

  // Obtener valores del formulario para la previsualización
  const watchedValues = watch();
  const { fileName, fileUrl } = watchedValues;

  // Función para abrir la ventana popup pequeña
  const openPopupWindow = () => {
    if (!fileUrl) return;

    // Limpiar ventana anterior si existe
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }

    // Configuración de la ventana popup pequeña
    const width = 900;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const features = `
      width=${width},
      height=${height},
      left=${left},
      top=${top},
      resizable=yes,
      scrollbars=yes,
      status=no,
      toolbar=no,
      location=no,
      menubar=no,
      directories=no
    `.replace(/\s/g, "");

    try {
      const newWindow = window.open(fileUrl, fileName || "Nextcloud Document", features);
      setPopupWindow(newWindow);
    } catch (error) {
      console.error("Error abriendo popup:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Información del Documento */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <h3>Información del Documento</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      Nombre del Archivo
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ejm: Presupuesto.pdf" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                      URL del Archivo
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://drive.acide.win/s/MEkDQHCwW2srxRS"
                          {...field}
                          disabled={isPending}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={openPopupWindow}
                            className="shrink-0"
                            disabled={isPending}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                      <p className="text-xs text-muted-foreground">
                        Haz clic en el botón para abrir el documento de Nextcloud en una ventana emergente
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 px-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || !form.formState.isValid} className="min-w-[120px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? "Actualizando..." : "Agregando..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {isUpdate ? "Actualizar" : "Agregar"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
