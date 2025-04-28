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

export enum EnumPermission {
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
  trainings = "trainings",
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
  [EnumResource.trainings]: "Certificaciones",
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
  [EnumResource.trainings]: GraduationCap,
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
