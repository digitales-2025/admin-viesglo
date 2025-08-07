"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckSquare,
  ChevronDown,
  Circle,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  Search,
  Send,
  Settings,
  ShieldCheckIcon,
  User,
  Zap,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateRole, useUpdateRole } from "../_hooks/use-roles";
import { usePermissions } from "../_hooks/usePermissions";
import { Role } from "../_types/roles";
import { EnumAction, groupedPermission, labelResource, resourceIcons, translateAction } from "../_utils/roles.utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Role;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  permissionsIds: z.array(z.string()).optional(),
});
type RolesForm = z.infer<typeof formSchema>;

// Plantillas de roles predefinidas
const ROLE_TEMPLATES = {
  admin: {
    name: "Administrador",
    description: "Acceso completo a todos los recursos",
    permissions: "all",
  },
  manager: {
    name: "Gerente",
    description: "Gestión de proyectos y equipos",
    permissions: ["projects:manage", "users:read", "reports:read", "dashboard:read"],
  },
  viewer: {
    name: "Visualizador",
    description: "Solo lectura en todos los recursos",
    permissions: "read-only",
  },
};

export function RolesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow?.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>(["users", "projects"]);

  // Hooks de mutación
  const { mutate: createRoleMutate, isPending: isCreating } = useCreateRole();
  const { mutate: updateRoleMutate, isPending: isUpdating } = useUpdateRole();
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  const isPending = isCreating || isUpdating;
  const groupedPermissions = groupedPermission(permissions);

  const form = useForm<RolesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionsIds: [],
    },
    mode: "onChange",
  });

  // Filtrar permisos por búsqueda
  const filteredGroups = groupedPermissions.filter((group) => {
    if (!searchTerm) return true;
    const resourceName = labelResource[group.resource as keyof typeof labelResource] || group.resource;
    return (
      resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.actions.some((action) => translateAction(action.action).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const onSubmit = (data: RolesForm) => {
    if (isUpdate && currentRow?.id) {
      updateRoleMutate(
        {
          id: currentRow.id,
          data: {
            name: data.name,
            description: data.description,
            permissionIds: data.permissionsIds || [],
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createRoleMutate(
        {
          name: data.name,
          description: data.description,
          permissionIds: data.permissionsIds || [],
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  // Aplicar plantilla de rol
  const applyTemplate = (templateKey: string) => {
    const template = ROLE_TEMPLATES[templateKey as keyof typeof ROLE_TEMPLATES];
    if (!template) return;

    form.setValue("name", template.name);
    form.setValue("description", template.description);

    if (template.permissions === "all") {
      // Seleccionar todos los permisos
      const allPermissionIds = groupedPermissions.flatMap((group) => group.actions.map((action) => action.id));
      form.setValue("permissionsIds", allPermissionIds);
    } else if (template.permissions === "read-only") {
      // Solo permisos de lectura
      const readPermissions = groupedPermissions.flatMap((group) =>
        group.actions.filter((action) => action.action === "read").map((action) => action.id)
      );
      form.setValue("permissionsIds", readPermissions);
    } else if (Array.isArray(template.permissions)) {
      form.setValue("permissionsIds", template.permissions);
    }

    setSelectedTemplate(templateKey);
  };

  // Toggle para seleccionar/deseleccionar todos los permisos
  const toggleAllPermissions = () => {
    const currentPermissions = form.getValues("permissionsIds") || [];
    const allPermissionIds = groupedPermissions.flatMap((group) => group.actions.map((action) => action.id));

    if (currentPermissions.length === allPermissionIds.length) {
      // Si todos están seleccionados, deseleccionar todos
      form.setValue("permissionsIds", []);
    } else {
      // Si no todos están seleccionados, seleccionar todos
      form.setValue("permissionsIds", allPermissionIds);
    }
  };

  // Toggle para seleccionar/deseleccionar todos los permisos de un tipo específico
  const toggleByAction = (actionType: string) => {
    const actionPermissions = groupedPermissions.flatMap((group) =>
      group.actions.filter((action) => action.action === actionType).map((action) => action.id)
    );
    const currentPermissions = form.getValues("permissionsIds") || [];

    // Verificar si todos los permisos de este tipo ya están seleccionados
    const allActionPermissionsSelected = actionPermissions.every((id) => currentPermissions.includes(id));

    if (allActionPermissionsSelected) {
      // Si todos están seleccionados, remover solo los de este tipo
      const newPermissions = currentPermissions.filter((id) => !actionPermissions.includes(id));
      form.setValue("permissionsIds", newPermissions);
    } else {
      // Si no todos están seleccionados, agregar los que faltan
      const newPermissions = Array.from(new Set([...currentPermissions, ...actionPermissions]));
      form.setValue("permissionsIds", newPermissions);
    }
  };

  // Expandir/colapsar todos los grupos
  const toggleAllGroups = () => {
    if (openGroups.length === groupedPermissions.length) {
      setOpenGroups([]);
    } else {
      setOpenGroups(groupedPermissions.map((group) => group.resource));
    }
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => (prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]));
  };

  // Lógica de permisos (mantenida del código original)
  const getReadPermissionId = (groupActions: any[]) => {
    const readPermission = groupActions.find((action) => action.action === EnumAction.read || action.action === "read");
    return readPermission?.id || null;
  };

  const hasActivePermissionsBesidesRead = (groupActions: any[], readPermissionId: string | null) => {
    if (!readPermissionId) return false;
    return groupActions.some(
      (action) => action.id !== readPermissionId && form.getValues("permissionsIds")?.includes(action.id)
    );
  };

  const handleGroupCheckboxChange = (checked: boolean, groupActions: any[]) => {
    const readPermissionId = getReadPermissionId(groupActions);
    if (!readPermissionId) return;

    const currentValues = form.getValues("permissionsIds") || [];

    if (checked) {
      if (!currentValues.includes(readPermissionId)) {
        form.setValue("permissionsIds", [...currentValues, readPermissionId], { shouldValidate: true });
      }
    } else {
      const updatedPermissions = currentValues.filter((id) => !groupActions.some((action) => action.id === id));
      form.setValue("permissionsIds", updatedPermissions, { shouldValidate: true });
    }
  };

  const handlePermissionChange = (checked: boolean, permissionId: string, groupActions: any[]) => {
    const readPermissionId = getReadPermissionId(groupActions);
    const currentValues = form.getValues("permissionsIds") || [];

    if (checked) {
      const newValues = [...currentValues, permissionId];

      if (readPermissionId && !newValues.includes(readPermissionId)) {
        newValues.push(readPermissionId);
      }

      form.setValue("permissionsIds", newValues, { shouldValidate: true });
    } else {
      const isReadPermission = permissionId === readPermissionId;

      if (isReadPermission) {
        const updatedPermissions = currentValues.filter((id) => !groupActions.some((action) => action.id === id));
        form.setValue("permissionsIds", updatedPermissions, { shouldValidate: true });
      } else {
        form.setValue(
          "permissionsIds",
          currentValues.filter((value) => value !== permissionId),
          { shouldValidate: true }
        );
      }
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description || "",
        permissionsIds: currentRow.permissionIds || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        permissionsIds: [],
      });
    }
  }, [isUpdate, currentRow?.id, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        permissionsIds: [],
      });
      setSelectedTemplate(null);
      setSearchTerm("");
    }
  }, [open, form]);

  const totalPermissions = groupedPermissions.reduce((acc, group) => acc + group.actions.length, 0);
  const selectedPermissions = form.watch("permissionsIds")?.length || 0;
  const currentPermissions = form.getValues("permissionsIds") || [];
  const allPermissionIds = groupedPermissions.flatMap((group) => group.actions.map((action) => action.id));

  // Verificar estados de los botones toggle
  const allSelected = currentPermissions.length === allPermissionIds.length;
  const readPermissions = groupedPermissions.flatMap((group) =>
    group.actions.filter((action) => action.action === "read").map((action) => action.id)
  );
  const writePermissions = groupedPermissions.flatMap((group) =>
    group.actions.filter((action) => action.action === "write").map((action) => action.id)
  );
  const managePermissions = groupedPermissions.flatMap((group) =>
    group.actions.filter((action) => action.action === "manage").map((action) => action.id)
  );

  const allReadSelected = readPermissions.every((id) => currentPermissions.includes(id));
  const allWriteSelected = writePermissions.every((id) => currentPermissions.includes(id));
  const allManageSelected = managePermissions.every((id) => currentPermissions.includes(id));

  return (
    <GenericSheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
      title={isUpdate ? "Actualizar rol" : "Crear rol"}
      description={
        isUpdate
          ? "Modifica la configuración del rol existente."
          : "Define un nuevo rol con sus permisos correspondientes."
      }
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="roles-form"
            type="submit"
            disabled={isPending}
            className="min-w-[180px] flex items-center justify-center"
          >
            {isPending ? (
              <>
                <span className="mr-2">Guardando...</span>
                <Send className="w-4 h-4 opacity-0" />
              </>
            ) : (
              <>
                <span className="mr-2">{isUpdate ? "Actualizar rol" : "Crear rol"}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      }
      maxWidth="xl"
      titleClassName="text-2xl font-bold capitalize"
    >
      {isLoadingPermissions ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Form {...form}>
          <form id="roles-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
            {/* Información básica mejorada */}
            <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
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
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plantillas rápidas</Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Selecciona una plantilla para aplicar rápidamente.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
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
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
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
              <div className="space-y-4">
                {/* Búsqueda mejorada */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar recursos o permisos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900"
                  />
                </div>

                {/* Acciones rápidas mejoradas con toggle */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Acciones rápidas
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={allSelected ? "default" : "outline"}
                      size="sm"
                      onClick={toggleAllPermissions}
                      className={cn(
                        "h-8 text-xs transition-all",
                        allSelected && "bg-emerald-500 hover:bg-emerald-600 text-white"
                      )}
                    >
                      <CheckSquare className="w-3 h-3 mr-1" />
                      {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                    </Button>

                    <Button
                      type="button"
                      variant={allReadSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleByAction("read")}
                      className={cn(
                        "h-8 text-xs transition-all",
                        allReadSelected && "bg-blue-500 hover:bg-blue-600 text-white"
                      )}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {allReadSelected ? "Quitar lectura" : "Solo lectura"}
                    </Button>

                    <Button
                      type="button"
                      variant={allWriteSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleByAction("write")}
                      className={cn(
                        "h-8 text-xs transition-all",
                        allWriteSelected && "bg-yellow-500 hover:bg-yellow-600 text-white"
                      )}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {allWriteSelected ? "Quitar escritura" : "Escritura"}
                    </Button>

                    <Button
                      type="button"
                      variant={allManageSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleByAction("manage")}
                      className={cn(
                        "h-8 text-xs transition-all",
                        allManageSelected && "bg-green-500 hover:bg-green-600 text-white"
                      )}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      {allManageSelected ? "Quitar gestión" : "Gestión"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleAllGroups}
                      className="h-8 text-xs ml-auto"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      {openGroups.length === groupedPermissions.length ? "Colapsar todo" : "Expandir todo"}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Lista de permisos */}
              <FormField
                control={form.control}
                name="permissionsIds"
                render={() => (
                  <FormItem>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredGroups.map((group) => {
                        const readPermissionId = getReadPermissionId(group.actions);
                        const isReadChecked = readPermissionId
                          ? form.getValues("permissionsIds")?.includes(readPermissionId)
                          : false;
                        const hasOtherActivePermissions = hasActivePermissionsBesidesRead(
                          group.actions,
                          readPermissionId
                        );

                        return (
                          <Collapsible
                            key={group.resource}
                            open={openGroups.includes(group.resource)}
                            onOpenChange={() => toggleGroup(group.resource)}
                            className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 overflow-hidden"
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                                  isReadChecked &&
                                    "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id={`group-${group.resource}`}
                                    checked={isReadChecked}
                                    onCheckedChange={(checked) => handleGroupCheckboxChange(!!checked, group.actions)}
                                    className={cn(
                                      "data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500",
                                      "border-gray-300 dark:border-gray-600 transition-colors"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const IconComponent = resourceIcons[group.resource as keyof typeof resourceIcons];
                                      return IconComponent ? (
                                        <IconComponent
                                          className={cn(
                                            "w-4 h-4 shrink-0 transition-colors",
                                            isReadChecked ? "text-emerald-600" : "text-gray-500"
                                          )}
                                        />
                                      ) : (
                                        <Circle
                                          className={cn(
                                            "w-4 h-4 shrink-0 transition-colors",
                                            isReadChecked ? "text-emerald-600" : "text-gray-500"
                                          )}
                                        />
                                      );
                                    })()}
                                    <Label
                                      htmlFor={`group-${group.resource}`}
                                      className={cn(
                                        "font-medium cursor-pointer transition-colors text-sm",
                                        isReadChecked && "text-emerald-700 dark:text-emerald-400"
                                      )}
                                    >
                                      {labelResource[group.resource as keyof typeof labelResource] || group.resource}
                                    </Label>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={isReadChecked ? "default" : "outline"}
                                    className={cn(
                                      "text-xs h-5",
                                      isReadChecked && "bg-emerald-100 text-emerald-800 border-emerald-200",
                                      hasOtherActivePermissions && "bg-emerald-200 text-emerald-900"
                                    )}
                                  >
                                    {
                                      group.actions.filter((p) => form.getValues("permissionsIds")?.includes(p.id))
                                        .length
                                    }
                                    /{group.actions.length}
                                  </Badge>
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      openGroups.includes(group.resource) && "transform rotate-180",
                                      isReadChecked ? "text-emerald-600" : "text-gray-400"
                                    )}
                                  />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <Separator className={cn(isReadChecked && "bg-emerald-200 dark:bg-emerald-800")} />
                              <div
                                className={cn(
                                  "p-3 space-y-2",
                                  isReadChecked && "bg-emerald-50/30 dark:bg-emerald-950/10"
                                )}
                              >
                                {group.actions
                                  .filter((permission) => permission.id !== readPermissionId)
                                  .map((permission) => (
                                    <FormField
                                      key={permission.id}
                                      control={form.control}
                                      name="permissionsIds"
                                      render={({ field }) => {
                                        const isChecked = field.value?.includes(permission.id);
                                        const isDisabled = !isReadChecked;

                                        return (
                                          <FormItem
                                            key={permission.id}
                                            className="flex flex-row items-center space-x-2 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                id={permission.id}
                                                className={cn(
                                                  "cursor-pointer data-[state=checked]:bg-emerald-500",
                                                  "data-[state=checked]:text-white transition-colors data-[state=checked]:border-emerald-500",
                                                  "border-emerald-400",
                                                  isDisabled && "opacity-50 cursor-not-allowed"
                                                )}
                                                checked={isChecked}
                                                disabled={isDisabled}
                                                onCheckedChange={(checked) =>
                                                  handlePermissionChange(!!checked, permission.id, group.actions)
                                                }
                                              />
                                            </FormControl>
                                            <label
                                              htmlFor={permission.id}
                                              className={cn(
                                                "text-sm text-gray-600 dark:text-gray-400 leading-none cursor-pointer",
                                                isChecked && "font-medium text-emerald-700 dark:text-emerald-400",
                                                isDisabled && "opacity-50 cursor-not-allowed"
                                              )}
                                            >
                                              {permission.description}
                                            </label>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      )}
    </GenericSheet>
  );
}
