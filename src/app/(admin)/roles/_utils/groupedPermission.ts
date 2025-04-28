import { Permission } from "../_types/roles";

enum EnumPermission {
  create = "create",
  read = "read",
  update = "update",
  delete = "delete",
  approve = "approve",
  reject = "reject",
  cancel = "cancel",
  process = "process",
  print = "print",
  export = "export",
  import = "import",
  download = "download",
  upload = "upload",
  edit = "edit",
}

export const labelPermission = {
  [EnumPermission.create]: "Crear",
  [EnumPermission.read]: "Visualizar",
  [EnumPermission.update]: "Actualizar",
  [EnumPermission.delete]: "Eliminar",
  [EnumPermission.approve]: "Aprobar",
  [EnumPermission.reject]: "Rechazar",
  [EnumPermission.cancel]: "Cancelar",
  [EnumPermission.process]: "Procesar",
  [EnumPermission.print]: "Imprimir",
  [EnumPermission.export]: "Exportar",
  [EnumPermission.import]: "Importar",
  [EnumPermission.download]: "Descargar",
  [EnumPermission.upload]: "Subir",
  [EnumPermission.edit]: "Editar",
};

export function groupedPermission(permissions: Permission[]) {
  return Object.values(
    permissions?.reduce<Record<string, { resource: string; actions: any[] }>>((acc, { resource, ...rest }) => {
      acc[resource] = acc[resource] || { resource, actions: [] };
      acc[resource].actions.push(rest);
      return acc;
    }, {}) || {}
  );
}
