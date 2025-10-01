import { FileText, Layers } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhasesForm } from "../../../_schemas/phases.schemas";

interface PhasesEditorFormProps {
  form: UseFormReturn<PhasesForm>;
  onSubmit: (data: PhasesForm) => void;
  isPending: boolean;
}

export default function PhasesEditorForm({ form, onSubmit, isPending }: PhasesEditorFormProps) {
  return (
    <Form {...form}>
      <form id="phases-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información de la Fase */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <h3>Información de la Fase</h3>
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
                      Nombre de la fase
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre de la fase" disabled={isPending} />
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
