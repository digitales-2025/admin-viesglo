"use client";

import { Calendar, Check, CreditCard, FileText, UserCheck, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMediaQuery } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { useProjectFieldsForm } from "../../_hooks/use-project-fields-form";
import { ProjectDetailedResponseDto } from "../../_types";
import { bondTypeConfig } from "../../_utils/projects.utils";

interface ProjectFieldsEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectDetailedResponseDto | null;
}

export default function ProjectFieldsEditorDialog({ open, onOpenChange, project }: ProjectFieldsEditorDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { form, onSubmit, isPending } = useProjectFieldsForm({
    project,
    onSuccess: () => onOpenChange(false),
  });

  const { handleSubmit } = form;

  // No renderizar si no hay proyecto
  if (!project) {
    return null;
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      title="Empresa"
      description="Actualizar información adicional del proyecto"
      dialogContentClassName="sm:max-w-xl px-0"
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerContentClassName="max-h-[60vh]"
      drawerScrollAreaClassName="h-full px-0"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Sección de Campos Requeridos */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3>Campos Requeridos</h3>
            </div>
            <div className="px-2 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Fecha de Carta Fianza */}
                <FormField
                  control={form.control}
                  name="requiredFields.bondDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        Fecha de Carta Fianza
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            const dateString = date ? date.toISOString().split("T")[0] : undefined;
                            field.onChange(dateString);
                          }}
                          placeholder="Elige una fecha de carta fianza..."
                          clearable
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de aval */}
                <FormField
                  control={form.control}
                  name="requiredFields.bondType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                        Tipo de aval
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona tipo de aval">
                              {field.value &&
                                (() => {
                                  const config = bondTypeConfig[field.value as keyof typeof bondTypeConfig];
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
                          <SelectContent>
                            {Object.entries(bondTypeConfig).map(([key, config]) => {
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Contrato */}
                <FormField
                  control={form.control}
                  name="requiredFields.proinnovateContract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        Fecha de Contrato
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            const dateString = date ? date.toISOString().split("T")[0] : undefined;
                            field.onChange(dateString);
                          }}
                          placeholder="Elige una fecha de contrato..."
                          clearable
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cuenta corriente vigente */}
                <FormField
                  control={form.control}
                  name="requiredFields.hasCurrentAccount"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          id="hasCurrentAccount"
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormLabel htmlFor="hasCurrentAccount" className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                        Cuenta corriente vigente
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          {/* Sección de Campos Opcionales */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
              <h3>Campos Opcionales</h3>
            </div>
            <div className="px-2 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Fecha de Certificación */}
                <FormField
                  control={form.control}
                  name="optionalFields.certificationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        Fecha de Certificación
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            const dateString = date ? date.toISOString().split("T")[0] : undefined;
                            field.onChange(dateString);
                          }}
                          placeholder="Elige una fecha de certificación..."
                          clearable
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Desembolso 1 */}
                <FormField
                  control={form.control}
                  name="optionalFields.milestone1Payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        Fecha de Desembolso 1
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            const dateString = date ? date.toISOString().split("T")[0] : undefined;
                            field.onChange(dateString);
                          }}
                          placeholder="Elige una fecha de desembolso 1..."
                          clearable
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fecha de Desembolso 2 */}
                <FormField
                  control={form.control}
                  name="optionalFields.milestone2Payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        Fecha de Desembolso 2
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            const dateString = date ? date.toISOString().split("T")[0] : undefined;
                            field.onChange(dateString);
                          }}
                          placeholder="Elige una fecha de desembolso 2..."
                          clearable
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Consultor aprobado */}
                <FormField
                  control={form.control}
                  name="requiredFields.approvedConsultant"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          id="approvedConsultant"
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormLabel htmlFor="approvedConsultant" className="text-sm font-medium flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                        Consultor aprobado
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Check className="w-4 h-4 mr-2" />
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
