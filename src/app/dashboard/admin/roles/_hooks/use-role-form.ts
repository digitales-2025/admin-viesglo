"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { RoleForm, roleSchema } from "../_schemas/roles.schemas";
import { EnumAction, EnumResource, ResourceName, Roles, SimplifiedActionName } from "../../settings/_types/roles.types";
import { useCreateRole, useUpdateRole } from "./use-roles";

interface UseRoleFormProps {
  isUpdate?: boolean;
  initialData?: Roles;
  onSuccess?: () => void;
}

export function useRoleForm({ isUpdate = false, initialData, onSuccess }: UseRoleFormProps) {
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
  const isPending = isCreating || isUpdating;

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const mappedPermissions =
        initialData.permissions?.map((perm) => ({
          resource: perm.resource as EnumResource,
          action: perm.action as EnumAction,
        })) || [];

      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        permissions: mappedPermissions,
      });
    }
  }, [initialData, isUpdate, form]);

  // Prepara los datos para enviar al backend
  const getSubmitData = (data: RoleForm) => ({
    ...data,
    permissions: Array.isArray(data.permissions)
      ? data.permissions.map((perm) => ({
          resource: perm.resource as ResourceName,
          action: perm.action as SimplifiedActionName,
        }))
      : [],
  });

  // Función para enviar el formulario
  const onSubmit = (data: RoleForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      updateRole(
        {
          params: { path: { id: initialData.id } },
          body: submitData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    } else {
      createRole(
        { body: submitData },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    }
  };

  return {
    form,
    isUpdate,
    onSuccess,
    isPending,
    getSubmitData,
    onSubmit,
  };
}
