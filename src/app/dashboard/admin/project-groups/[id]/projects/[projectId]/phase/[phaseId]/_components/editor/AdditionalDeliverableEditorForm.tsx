import { FileText, Package } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { AdditionalDeliverableForm } from "../../../../../_schemas/additional-deliverables.schemas";

interface AdditionalDeliverableEditorFormProps {
  form: UseFormReturn<AdditionalDeliverableForm>;
  onSubmit: (data: AdditionalDeliverableForm) => void;
  isPending: boolean;
}

export default function AdditionalDeliverableEditorForm({
  form,
  onSubmit,
  isPending,
}: AdditionalDeliverableEditorFormProps) {
  return (
    <Form {...form}>
      <form id="additional-deliverable-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información Básica del Entregable Adicional */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <h3>Información del Entregable Adicional</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      Nombre del entregable adicional
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre del entregable adicional" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      Descripción
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ingrese una descripción del entregable adicional (opcional)"
                        disabled={isPending}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>
      </form>
    </Form>
  );
}
