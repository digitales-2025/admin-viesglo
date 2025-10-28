import { AlertTriangle, FileText, Package, Target } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { DeliverableForm } from "../../../../../_schemas/deliverables.schemas";
import { deliverablePriorityConfig } from "../../../../../_utils/projects.utils";

interface DeliverableEditorFormProps {
  form: UseFormReturn<DeliverableForm>;
  onSubmit: (data: DeliverableForm) => void;
  isPending: boolean;
}

export default function DeliverableEditorForm({ form, onSubmit, isPending }: DeliverableEditorFormProps) {
  return (
    <Form {...form}>
      <form id="deliverable-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información Básica del Entregable */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <h3>Información del Entregable</h3>
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
                      Nombre del entregable
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre del entregable" disabled={isPending} />
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
                        placeholder="Ingrese una descripción del entregable (opcional)"
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

        {/* Peso y Prioridad */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <h3>Configuración del Entregable</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                      Prioridad
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione la prioridad">
                            {field.value &&
                              (() => {
                                const config =
                                  deliverablePriorityConfig[field.value as keyof typeof deliverablePriorityConfig];
                                if (config) {
                                  const IconComponent = config.icon;
                                  return (
                                    <div className="flex items-center gap-2">
                                      <IconComponent className={cn("h-4 w-4", config.iconClass)} />
                                      <span>{config.label}</span>
                                    </div>
                                  );
                                }
                                return field.value;
                              })()}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(deliverablePriorityConfig).map(([key, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <IconComponent className={cn("h-4 w-4", config.iconClass)} />
                                <div className="flex flex-col">
                                  <span className="font-medium">{config.label}</span>
                                  <span className="text-xs text-muted-foreground">{config.description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
