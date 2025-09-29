import { Calendar, Flag } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { MilestoneForm } from "../../_schemas/milestones.schemas";

interface ProjectMilestoneEditorFormProps {
  form: UseFormReturn<MilestoneForm>;
  onSubmit: (data: MilestoneForm) => void;
  isPending: boolean;
}

export default function ProjectMilestoneEditorForm({ form, onSubmit, isPending }: ProjectMilestoneEditorFormProps) {
  return (
    <Form {...form}>
      <form id="milestone-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información Básica del Hito */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Flag className="h-4 w-4" />
            </div>
            <h3>Información del Hito</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Flag className="h-4 w-4 text-muted-foreground shrink-0" />
                      Nombre del hito
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre del hito" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        {/* Fechas del Hito */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <h3>Fechas del Hito</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      Fecha de inicio
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          const dateString = date ? date.toISOString() : undefined;
                          field.onChange(dateString);
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      Fecha de fin
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          const dateString = date ? date.toISOString() : undefined;
                          field.onChange(dateString);
                        }}
                        disabled={isPending}
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
