"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
} from "@/shared/components/ui/sheet";
import { usePermissions } from "../_hooks/usePermissions";
import { useCreateRole, useUpdateRole } from "../_hooks/useRoles";
import { Role } from "../_types/roles";

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
      name: currentRow?.name || "",
      description: currentRow?.description || "",
      permissionsIds: currentRow?.permissionIds || [],
    },
  });
  console.log("🚀 ~ RolesMutateDrawer ~ currentRow:", currentRow);
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
      console.log("🚀 ~ onSubmit ~ data:", data);
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
  const [openGroups, setOpenGroups] = useState<string[]>(["database"]);
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  const groupedPermissions = Object.values(
    permissions?.reduce<Record<string, { resource: string; actions: any[] }>>((acc, { resource, ...rest }) => {
      acc[resource] = acc[resource] || { resource, actions: [] };
      acc[resource].actions.push(rest);
      return acc;
    }, {}) || {}
  );
  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => (prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]));
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
        <ScrollArea className="h-[calc(100vh-250px)]">
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
                        <Input {...field} placeholder="Ingrese un nombre" disabled={isPending} />
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
                        <Input {...field} placeholder="Ingrese una descripción" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="permissionsIds"
                  render={() => (
                    <FormItem>
                      <div className="space-y-6">
                        {groupedPermissions.map((group) => (
                          <Collapsible
                            key={group.resource}
                            open={openGroups.includes(group.resource)}
                            onOpenChange={() => toggleGroup(group.resource)}
                            className="border rounded-md bg-background"
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id={`group-${group.resource}`}
                                    checked={group.actions.every((p) =>
                                      form.getValues("permissionsIds")?.includes(p.id)
                                    )}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`group-${group.resource}`}
                                      className="font-medium cursor-pointer flex items-center"
                                    >
                                      <span className="ml-2 capitalize font-semibold">{group.resource}</span>
                                    </Label>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {
                                      group.actions.filter((p) => form.getValues("permissionsIds")?.includes(p.id))
                                        .length
                                    }{" "}
                                    / {group.actions.length}
                                  </Badge>
                                  <ChevronDown
                                    className={`h-5 w-5 transition-transform ${openGroups.includes(group.resource) ? "transform rotate-180" : ""}`}
                                  />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <Separator />
                              <div className="p-4 space-y-3">
                                {group.actions.map((permission) => (
                                  <FormField
                                    key={permission.id}
                                    control={form.control}
                                    name="permissionsIds"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={permission.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              id={permission.id}
                                              checked={field.value?.includes(permission.id)}
                                              onCheckedChange={(checked) => {
                                                const currentValues = field.value || [];
                                                return checked
                                                  ? field.onChange([...currentValues, permission.id])
                                                  : field.onChange(
                                                      currentValues.filter((value) => value !== permission.id)
                                                    );
                                              }}
                                            />
                                          </FormControl>
                                          <label
                                            htmlFor={permission.id}
                                            className="text-xs text-muted-foreground leading-none "
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
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
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
