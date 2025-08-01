import { Briefcase, CheckCircle, Lock, RefreshCw, Send, Settings, Shield, Unlock, User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { ChangePasswordFormData, CreateUserFormData, UpdateUserFormData } from "../_schemas/users.schemas";

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export const resourceIcons = {
  projects: Briefcase,
  clients: User,
  milestones: CheckCircle,
  phases: Settings,
  deliverables: Send,
  activities: RefreshCw,
  users: User,
  reports: Shield,
  dashboard: Settings,
  system: Lock,
  "*": Unlock,
};

export const actionColors = {
  read: "bg-blue-100 text-blue-700 border-blue-200",
  update: "bg-yellow-100 text-yellow-700 border-yellow-200",
  manage: "bg-green-100 text-green-700 border-green-200",
  admin: "bg-red-100 text-red-700 border-red-200",
  "*": "bg-purple-100 text-purple-700 border-purple-200",
};

/**
 * Traduce el nombre del recurso a una etiqueta legible en español.
 */
export function translateResource(resource: string): string {
  const map: Record<string, string> = {
    users: "Usuarios",
    projects: "Proyectos",
    clients: "Clientes",
    milestones: "Hitos",
    phases: "Fases",
    deliverables: "Entregables",
    activities: "Actividades",
    roles: "Roles",
    notifications: "Notificaciones",
    reports: "Reportes",
    dashboard: "Dashboard",
    system: "Sistema",
    "*": "Todos los recursos",
  };
  return map[resource] || resource;
}

/**
 * Traduce el nombre de la acción a una etiqueta legible en español.
 */
export function translateAction(action: string): string {
  const map: Record<string, string> = {
    create: "Crear",
    read: "Ver",
    update: "Actualizar",
    delete: "Eliminar",
    manage: "Gestionar",
    assign: "Asignar",
    approve: "Aprobar",
    export: "Exportar",
    admin: "Administrar",
    "*": "Todas las acciones",
  };
  return map[action] || action;
}

export const copyPassword = async (password: string, setCopiedPassword: (value: boolean) => void) => {
  if (password) {
    await navigator.clipboard.writeText(password);
    setCopiedPassword(true);

    // Toast personalizado al copiar
    toast(
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CheckCircle color="#22c55e" size={22} />
        <span>
          <b>¡Contraseña copiada!</b> <br />
          Puedes pegarla donde la necesites.
        </span>
      </div>,
      {
        style: {
          background: "#f0fdf4",
          color: "#166534",
          border: "1px solid #22c55e",
        },
        duration: 2500,
      }
    );

    setTimeout(() => setCopiedPassword(false), 2000);
  }
};

export const getRoleStatusBadge = (role: any) => {
  if (role.isSystem) {
    return (
      <Badge variant="destructive" className="text-xs">
        Sistema
      </Badge>
    );
  }
  if (!role.isActive) {
    return (
      <Badge variant="secondary" className="text-xs">
        Inactivo
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
      Activo
    </Badge>
  );
};

export const generateAdvancedPassword = (
  isForPasswordChange = false,
  passwordOptions: PasswordOptions,
  userForm: UseFormReturn<CreateUserFormData> | UseFormReturn<UpdateUserFormData>,
  isUpdate: boolean,
  passwordForm?: UseFormReturn<ChangePasswordFormData>
) => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let charset = "";
  const requiredChars: string[] = [];

  if (passwordOptions.includeUppercase) {
    charset += uppercase;
    requiredChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
  }
  if (passwordOptions.includeLowercase) {
    charset += lowercase;
    requiredChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
  }
  if (passwordOptions.includeNumbers) {
    charset += numbers;
    requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
  }
  if (passwordOptions.includeSymbols) {
    charset += symbols;
    requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  if (charset === "") {
    charset = lowercase + numbers;
    requiredChars.push(
      lowercase[Math.floor(Math.random() * lowercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)]
    );
  }

  let password = requiredChars.join("");
  for (let i = password.length; i < passwordOptions.length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Mezclar la contraseña para evitar que los caracteres requeridos estén siempre al principio
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  // Toast personalizado con icono y color
  toast(
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Lock color="#22c55e" size={22} />
      <span>
        <b>¡Contraseña generada!</b> <br />
        Tu nueva contraseña segura está lista.
      </span>
    </div>,
    {
      style: {
        background: "#e6fffa",
        color: "#065f46",
        border: "1px solid #22c55e",
      },
      duration: 3500,
    }
  );

  if (isForPasswordChange && passwordForm) {
    passwordForm.setValue("newPassword", password);
    passwordForm.setValue("confirmPassword", password);
  } else if (!isUpdate) {
    (userForm as UseFormReturn<CreateUserFormData>).setValue("password", password);
  }
};
