import { FileText, ShieldCheckIcon, User, Zap } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";
import { RoleForm } from "../../_schemas/roles.schemas";
import { Permission } from "../../_types/roles";
import { groupedPermission, roleTemplates } from "../../_utils/roles.utils";
import { EnumAction, EnumResource } from "../../../settings/_types/roles.types";
import PermissionsConfiguration from "./PermissionsConfiguration";
import PermissionsRolesForm from "./PermissionsRolesForm";

interface RolesEditorFormProps {
  form: UseFormReturn<RoleForm>;
  onSubmit: (data: RoleForm) => void;
  isPending: boolean;
  isUpdate: boolean;
  permissions: Permission;
  selectedTemplate: string | null;
  setSelectedTemplate: (template: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openGroups: string[];
  setOpenGroups: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function RolesEditorForm({
  form,
  onSubmit,
  isPending,
  isUpdate,
  permissions,
  selectedTemplate,
  setSelectedTemplate,
  searchTerm,
  setSearchTerm,
  openGroups,
  setOpenGroups,
}: RolesEditorFormProps) {
  const groupedPermissions = groupedPermission(permissions);

  const totalPermissions = groupedPermissions.reduce((acc, group) => acc + group.actions.length, 0);
  const selectedPermissions = form.watch("permissions")?.length || 0;
  const currentPermissions = form.getValues("permissions") || [];

  // Aplicar plantilla de rol
  const applyTemplate = (templateKey: string) => {
    const template = roleTemplates[templateKey as keyof typeof roleTemplates];
    if (!template) return;

    form.setValue("name", template.name);
    form.setValue("description", template.description);

    if (template.permissions === "all") {
      // Seleccionar todos los permisos
      const allPermissions = groupedPermissions.flatMap((group) =>
        group.actions.map((action) => ({
          resource: EnumResource[group.resource as keyof typeof EnumResource],
          action: EnumAction[action.action as keyof typeof EnumAction],
        }))
      );
      form.setValue("permissions", allPermissions);
    } else if (template.permissions === "read-only") {
      // Solo permisos de lectura
      const readPermissions = groupedPermissions.flatMap((group) =>
        group.actions
          .filter((action) => action.action === EnumAction.read)
          .map((action) => ({
            resource: EnumResource[group.resource as keyof typeof EnumResource],
            action: EnumAction[action.action as keyof typeof EnumAction],
          }))
      );
      form.setValue("permissions", readPermissions);
    } else if (Array.isArray(template.permissions)) {
      // Permisos personalizados (ejemplo: ["projects:manage", ...])
      const customPermissions = template.permissions
        .map((permStr) => {
          const [resource, action] = permStr.split(":");
          if (
            resource &&
            action &&
            Object.values(EnumResource).includes(resource as EnumResource) &&
            Object.values(EnumAction).includes(action as EnumAction)
          ) {
            return {
              resource: resource as EnumResource,
              action: action as EnumAction,
            };
          }
          return null;
        })
        .filter(Boolean) as { resource: EnumResource; action: EnumAction }[];
      form.setValue("permissions", customPermissions);
    }

    setSelectedTemplate(templateKey);
  };

  return (
    <Form {...form}>
      <form id="roles-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información básica mejorada */}
        <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <Label className="text-sm font-medium">Información del rol</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Define el nombre y la descripción del rol.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    Nombre del rol
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Administrador, Gerente, Consultor..." disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe las responsabilidades de este rol..."
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Plantillas de roles */}
        {!isUpdate && (
          <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-medium">Plantillas rápidas</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selecciona una plantilla para aplicar rápidamente.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(roleTemplates).map(([key, template]) => (
                <Button
                  key={key}
                  type="button"
                  variant={selectedTemplate === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTemplate(key)}
                  className="text-xs h-9 transition-all hover:scale-105"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sección de permisos mejorada */}
        <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-medium">Configuración de permisos</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedPermissions} de {totalPermissions} permisos seleccionados
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            >
              {Math.round((selectedPermissions / totalPermissions) * 100)}% configurado
            </Badge>
          </div>

          {/* Controles de permisos mejorados */}
          <PermissionsConfiguration
            form={form}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPermissions={currentPermissions}
            groupedPermissions={groupedPermissions}
            openGroups={openGroups}
            setOpenGroups={setOpenGroups}
          />

          <Separator />

          <PermissionsRolesForm
            form={form}
            currentPermissions={currentPermissions}
            groupedPermissions={groupedPermissions}
            searchTerm={searchTerm}
            openGroups={openGroups}
            setOpenGroups={setOpenGroups}
          />
        </div>
      </form>
    </Form>
  );
}
