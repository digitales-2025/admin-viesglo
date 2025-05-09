import {
  Banknote,
  BriefcaseBusiness,
  Building,
  FileCheck,
  Files,
  GraduationCap,
  Group,
  Hospital,
  KeyRound,
  Layers,
  SquareActivity,
  Users,
} from "lucide-react";

import { Permission } from "../_types/roles";

export enum EnumAction {
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
  [EnumAction.create]: "Crear",
  [EnumAction.read]: "Visualizar",
  [EnumAction.update]: "Actualizar",
  [EnumAction.delete]: "Eliminar",
  [EnumAction.approve]: "Aprobar",
  [EnumAction.reject]: "Rechazar",
  [EnumAction.cancel]: "Cancelar",
  [EnumAction.process]: "Procesar",
  [EnumAction.print]: "Imprimir",
  [EnumAction.export]: "Exportar",
  [EnumAction.import]: "Importar",
  [EnumAction.download]: "Descargar",
  [EnumAction.upload]: "Subir",
  [EnumAction.edit]: "Editar",
};

export enum EnumResource {
  users = "users",
  roles = "roles",
  projects = "projects",
  occupationalHealth = "occupationalHealth",
  clinics = "clinics",
  clients = "clients",
  services = "services",
  quotationGroups = "quotationGroups",
  diagnostic = "diagnostic",
  quotations = "quotations",
  payments = "payments",
  certificate = "certificate",
}

export const labelResource = {
  [EnumResource.users]: "Usuarios",
  [EnumResource.roles]: "Roles",
  [EnumResource.projects]: "Seguimientos de Proyectos ",
  [EnumResource.occupationalHealth]: "Salud Ocupacional",
  [EnumResource.clinics]: "Clínicas",
  [EnumResource.clients]: "Clientes",
  [EnumResource.services]: "Servicios",
  [EnumResource.diagnostic]: "Listado de Diagnósticos",
  [EnumResource.quotationGroups]: "Grupos de cotizaciones",
  [EnumResource.quotations]: "Cotizaciones",
  [EnumResource.payments]: "Pagos",
  [EnumResource.certificate]: "Certificaciones",
};

export const iconResource = {
  [EnumResource.users]: Users,
  [EnumResource.roles]: KeyRound,
  [EnumResource.projects]: Layers,
  [EnumResource.occupationalHealth]: SquareActivity,
  [EnumResource.clinics]: Hospital,
  [EnumResource.clients]: Building,
  [EnumResource.services]: BriefcaseBusiness,
  [EnumResource.diagnostic]: FileCheck,
  [EnumResource.quotationGroups]: Group,
  [EnumResource.quotations]: Files,
  [EnumResource.payments]: Banknote,
  [EnumResource.certificate]: GraduationCap,
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
