import { UseFormReturn } from "react-hook-form";

import { ClientSearch } from "@/app/dashboard/admin/clients/search/client-search";
import { UserSearch } from "@/app/dashboard/admin/users/search/user-search";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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
      <form id="projects-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Nombre del proyecto</FormLabel>
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
            <FormItem className="space-y-1">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ingrese una descripción del proyecto" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Tipo de proyecto</FormLabel>
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
            <FormItem className="space-y-1">
              <FormLabel>Estado inicial</FormLabel>
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
          name="clientId"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Cliente</FormLabel>
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
            <FormItem className="space-y-1">
              <FormLabel>Coordinador</FormLabel>
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

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="space-y-1 flex-1">
              <FormLabel>Fecha de inicio</FormLabel>
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
        {!isUpdate ? (
          <SelectProjectTemplates form={form} />
        ) : (
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Las plantillas de un proyecto se pueden ver al seleccionar el proyecto.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
