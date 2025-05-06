"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Circle, Loader2, ShieldCheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet-responsive";
import { usePermissions } from "../_hooks/usePermissions";
import { useCreateRole, useUpdateRole } from "../_hooks/useRoles";
import { Role } from "../_types/roles";
import { EnumAction, groupedPermission, iconResource, labelResource } from "../_utils/groupedPermission";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Role;
}

// Esquema simplificado para coincidir con la estructura de Role
const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  permissionsIds: z.array(z.string()).optional(),
});
type RolesForm = z.infer<typeof formSchema>;

export function RolesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow?.id;
  // Hooks de mutación
  const { mutate: createRoleMutate, isPending: isCreating } = useCreateRole();
  const { mutate: updateRoleMutate, isPending: isUpdating } = useUpdateRole();

  const isPending = isCreating || isUpdating;

  const form = useForm<RolesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionsIds: [],
    },
    mode: "onChange",
  });
  const onSubmit = (data: RolesForm) => {
    if (isUpdate && currentRow?.id) {
      // Actualizar rol existente
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
      // Crear nuevo rol
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        permissionsIds: [],
      });
    }
  }, [open, form]);

  const [openGroups, setOpenGroups] = useState<string[]>(["database"]);
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  const groupedPermissions = groupedPermission(permissions || []);
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => (prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]));
  };

  // Encontrar permiso de 'read' para cada grupo
  const getReadPermissionId = (groupActions: any[]) => {
    const readPermission = groupActions.find((action) => action.action === EnumAction.read || action.action === "read");
    return readPermission?.id || null;
  };

  // Verificar si hay permisos activos además del 'read' en un grupo
  const hasActivePermissionsBesidesRead = (groupActions: any[], readPermissionId: string | null) => {
    if (!readPermissionId) return false;
    return groupActions.some(
      (action) => action.id !== readPermissionId && form.getValues("permissionsIds")?.includes(action.id)
    );
  };

  // Manejar el cambio de estado del checkbox de grupo (header)
  const handleGroupCheckboxChange = (checked: boolean, groupActions: any[]) => {
    const readPermissionId = getReadPermissionId(groupActions);
    if (!readPermissionId) return;

    const currentValues = form.getValues("permissionsIds") || [];

    if (checked) {
      // Si se marca, agregar el permiso de lectura si no está ya incluido
      if (!currentValues.includes(readPermissionId)) {
        form.setValue("permissionsIds", [...currentValues, readPermissionId], { shouldValidate: true });
      }
    } else {
      // Si se desmarca, quitar todos los permisos del grupo
      const updatedPermissions = currentValues.filter((id) => !groupActions.some((action) => action.id === id));
      form.setValue("permissionsIds", updatedPermissions, { shouldValidate: true });
    }
  };

  // Manejar el cambio de estado de cualquier permiso individual
  const handlePermissionChange = (checked: boolean, permissionId: string, groupActions: any[]) => {
    const readPermissionId = getReadPermissionId(groupActions);
    const currentValues = form.getValues("permissionsIds") || [];

    if (checked) {
      // Si se marca cualquier permiso, asegurarse de que 'read' también esté marcado
      const newValues = [...currentValues, permissionId];

      if (readPermissionId && !newValues.includes(readPermissionId)) {
        newValues.push(readPermissionId);
      }

      form.setValue("permissionsIds", newValues, { shouldValidate: true });
    } else {
      // Si se desmarca, quitar solo ese permiso
      // Si es el permiso 'read', quitar también todos los demás permisos del grupo
      const isReadPermission = permissionId === readPermissionId;

      if (isReadPermission) {
        // Si es 'read', quitar todos los permisos del grupo
        const updatedPermissions = currentValues.filter((id) => !groupActions.some((action) => action.id === id));
        form.setValue("permissionsIds", updatedPermissions, { shouldValidate: true });
      } else {
        // Si no es 'read', solo quitar ese permiso específico
        form.setValue(
          "permissionsIds",
          currentValues.filter((value) => value !== permissionId),
          { shouldValidate: true }
        );
      }
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
    >
      <SheetContent className="flex flex-col ">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">{isUpdate ? "Actualizar" : "Crear"} rol</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza el rol proporcionando la información necesaria."
              : "Agrega un nuevo rol proporcionando la información necesaria."}{" "}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Form {...form}>
              <form id="tasks-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingrese el nombre del rol (Ej: Administrador)"
                          disabled={isPending}
                        />
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
                        <Input
                          {...field}
                          placeholder="Ingrese una descripción del rol (Ej: Rol para administradores)"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <fieldset className="space-y-6 border p-4 rounded-md">
                  <legend className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                    Permisos
                  </legend>
                  <FormField
                    control={form.control}
                    name="permissionsIds"
                    render={() => (
                      <FormItem>
                        <div className="space-y-6">
                          {groupedPermissions.map((group) => {
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
                                className="border rounded-md bg-background overflow-hidden"
                              >
                                <CollapsibleTrigger asChild>
                                  <div
                                    className={cn(
                                      "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors",
                                      isReadChecked && "bg-emerald-500/10 hover:bg-emerald-500/20"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        id={`group-${group.resource}`}
                                        checked={isReadChecked}
                                        onCheckedChange={(checked) =>
                                          handleGroupCheckboxChange(!!checked, group.actions)
                                        }
                                        className={cn(
                                          "data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white data-[state=checked]:border-emerald-500",
                                          "border-muted-foreground transition-colors "
                                        )}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <div>
                                        <Label
                                          htmlFor={`group-${group.resource}`}
                                          className="font-medium cursor-pointer flex items-center"
                                        >
                                          <span className="first-letter:uppercase font-semibold flex items-center gap-2">
                                            {(() => {
                                              const IconComponent =
                                                iconResource[group.resource as keyof typeof iconResource];
                                              return IconComponent ? (
                                                <IconComponent
                                                  className={cn(
                                                    "w-4 h-4 shrink-0 transition-colors",
                                                    isReadChecked ? "text-emerald-600" : "text-muted-foreground/70"
                                                  )}
                                                />
                                              ) : (
                                                <Circle
                                                  className={cn(
                                                    "w-4 h-4 shrink-0 transition-colors",
                                                    isReadChecked ? "text-emerald-600" : "text-muted-foreground/70"
                                                  )}
                                                />
                                              );
                                            })()}
                                            <span
                                              className={cn("transition-colors", isReadChecked && "text-emerald-700")}
                                            >
                                              {labelResource[group.resource as keyof typeof labelResource] ||
                                                group.resource}
                                            </span>
                                          </span>
                                        </Label>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={isReadChecked ? "success" : "outline"}
                                        className={cn(hasOtherActivePermissions && "bg-emerald-100 text-emerald-800")}
                                      >
                                        <span
                                          className={cn(
                                            "transition-colors",
                                            isReadChecked && "text-emerald-700 font-semibold"
                                          )}
                                        >
                                          {
                                            group.actions.filter((p) =>
                                              form.getValues("permissionsIds")?.includes(p.id)
                                            ).length
                                          }{" "}
                                        </span>
                                        / {group.actions.length}
                                      </Badge>
                                      <ChevronDown
                                        className={`h-5 w-5 transition-transform ${
                                          openGroups.includes(group.resource) ? "transform rotate-180" : ""
                                        } ${isReadChecked ? "text-emerald-600" : "text-muted-foreground"}`}
                                      />
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <Separator className={cn(isReadChecked && "bg-emerald-200 dark:bg-emerald-800")} />
                                  <div
                                    className={cn(
                                      "p-4 space-y-3",
                                      isReadChecked && "bg-emerald-50/50 dark:bg-emerald-900/10"
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
                                                className="flex flex-row items-center space-x-1 space-y-1"
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
                                                    "text-xs text-muted-foreground leading-none cursor-pointer",
                                                    isChecked && "font-bold text-emerald-600",
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
                </fieldset>
              </form>
            </Form>
          )}
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="tasks-form" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
