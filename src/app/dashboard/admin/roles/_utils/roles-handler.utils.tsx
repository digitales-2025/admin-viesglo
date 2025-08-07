import { UseFormReturn } from "react-hook-form";

import { RoleForm } from "../_schemas/roles.schemas";
import { EnumAction, EnumResource } from "../../settings/_types/roles.types";

export const handleGroupCheckboxChange = (checked: boolean, groupActions: any[], form: UseFormReturn<RoleForm>) => {
  // Buscar el permiso de lectura en el grupo
  const readPermission = groupActions.find(
    (action: any) => action.action === EnumAction.read || action.action === "read"
  );
  if (!readPermission) return;

  const currentPermissions = form.getValues("permissions") || [];

  if (checked) {
    // Agregar el permiso de lectura si no está
    const alreadyExists = currentPermissions.some(
      (perm) => perm.resource === readPermission.resource && perm.action === readPermission.action
    );
    if (!alreadyExists) {
      form.setValue(
        "permissions",
        [...currentPermissions, { resource: readPermission.resource, action: readPermission.action }],
        { shouldValidate: true }
      );
    }
  } else {
    // Quitar todos los permisos de ese grupo
    const updatedPermissions = currentPermissions.filter((perm) => perm.resource !== readPermission.resource);
    form.setValue("permissions", updatedPermissions, { shouldValidate: true });
  }
};

export const handlePermissionChange = (
  checked: boolean,
  permission: { resource: EnumResource; action: EnumAction },
  form: UseFormReturn<RoleForm>
) => {
  const currentPermissions = form.getValues("permissions") || [];

  if (checked) {
    // Agregar el permiso si no está
    const alreadyExists = currentPermissions.some(
      (perm) => perm.resource === permission.resource && perm.action === permission.action
    );
    if (!alreadyExists) {
      form.setValue(
        "permissions",
        [...currentPermissions, { resource: permission.resource, action: permission.action }],
        { shouldValidate: true }
      );
    }
  } else {
    // Quitar el permiso
    const updatedPermissions = currentPermissions.filter(
      (perm) => !(perm.resource === permission.resource && perm.action === permission.action)
    );
    form.setValue("permissions", updatedPermissions, { shouldValidate: true });
  }
};
