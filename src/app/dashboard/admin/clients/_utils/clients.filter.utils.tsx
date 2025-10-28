import { CheckCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

// Componentes de icono con estilos integrados
const ActiveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <CheckCircle className={cn(className, "text-emerald-500")} />
);

const InactiveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <XCircle className={cn(className, "text-red-500")} />
);

export const facetedFilters = [
  {
    column: "estado",
    title: "Estado",
    options: [
      {
        label: "Activo",
        value: true,
        icon: ActiveIcon,
      },
      {
        label: "Inactivo",
        value: false,
        icon: InactiveIcon,
      },
    ],
  },
];
