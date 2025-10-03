import { Briefcase, Building2, Calendar, FileText, Info, Settings, UserCheck, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ClientSearch } from "@/app/dashboard/admin/clients/search/ClientSearch";
import { UserSearch } from "@/app/dashboard/admin/users/search/UserSearch";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { ProjectsForm } from "../../_schemas/projects.schemas";
import { projectStatusConfig, projectTypeConfig } from "../../_utils/projects.utils";
import SelectProjectTemplates from "./SelectProjectTemplates";

interface ProjectsEditorFormProps {
  form: UseFormReturn<ProjectsForm>;
  onSubmit: (data: ProjectsForm) => void;
  isUpdate: boolean;
  isPending: boolean;
}

export default function ProjectsEditorForm({ form, onSubmit, isUpdate, isPending }: ProjectsEditorFormProps) {
  return (
    <Form {...form}>
      <form id="projects-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información Básica */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <h3>Información Básica</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      Nombre del proyecto
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre del proyecto" disabled={isPending} />
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
                      <Textarea {...field} placeholder="Ingrese una descripción del proyecto" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        {/* Configuración del Proyecto */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Settings className="h-4 w-4" />
            </div>
            <h3>Configuración del Proyecto</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      Tipo de proyecto
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un tipo">
                            {field.value &&
                              (() => {
                                const config = projectTypeConfig[field.value as keyof typeof projectTypeConfig];
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
                          {Object.entries(projectTypeConfig).map(([key, config]) => {
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                      Estado inicial
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un estado">
                            {field.value &&
                              (() => {
                                const config = projectStatusConfig[field.value as keyof typeof projectStatusConfig];
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
                          {Object.entries(projectStatusConfig).map(([key, config]) => {
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

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      Fecha de inicio
                      <span className="text-red-500">*</span>
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

        {/* Información de Contactos */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <h3>Información de Contactos</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      Cliente
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ClientSearch
                        value={field.value}
                        onAddItem={(clientId) => {
                          field.onChange(clientId);
                        }}
                        onDuplicate={() => false}
                        filterByActive={true}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      Coordinador
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <UserSearch
                        value={field.value}
                        onAddItem={(userId) => {
                          field.onChange(userId);
                        }}
                        onDuplicate={() => false}
                        filterByActive={true}
                        filterBySystemRolePosition={3}
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

        {/* Información Adicional */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Info className="h-4 w-4" />
            </div>
            <h3>Información Adicional</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="commercialExecutive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      Ejecutivo comercial
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre del ejecutivo comercial" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="implementingCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      Empresa implementadora
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ingrese el nombre de la empresa implementadora"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="externalReviewer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      Revisor externo
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el nombre del revisor externo" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>

        {/* Plantillas de Proyecto */}
        {!isUpdate ? (
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3>Plantillas de Proyecto</h3>
            </div>
            <div className="px-2">
              <SelectProjectTemplates form={form} />
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3>Plantillas de Proyecto</h3>
            </div>
            <div className="px-2">
              <div className="flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Las plantillas de un proyecto se pueden ver al seleccionar el proyecto.
                </p>
              </div>
            </div>
          </section>
        )}
      </form>
    </Form>
  );
}
