import { Row } from "@tanstack/react-table";
import { Copy, Download, Edit, LucideIcon, MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

// Tipo para definir una acción individual
export interface TableAction<TData> {
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive" | "secondary" | "ghost";
  disabled?: boolean;
}

// Interfaz principal para las props del componente
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions?: TableAction<TData>[];
  // Acciones predefinidas comunes
  showEdit?: boolean;
  showDelete?: boolean;
  showCopy?: boolean;
  showDownload?: boolean;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onCopy?: (row: TData) => void;
  onDownload?: (row: TData) => void;
}

export function DataTableRowActions<TData>({
  row,
  actions = [],
  showEdit = false,
  showDelete = false,
  showCopy = false,
  showDownload = false,
  onEdit,
  onDelete,
  onCopy,
  onDownload,
}: DataTableRowActionsProps<TData>) {
  // Datos originales de la fila
  const rowData = row.original;

  // Crear lista de acciones predefinidas si están habilitadas
  const predefinedActions: TableAction<TData>[] = [];

  if (showEdit && onEdit) {
    predefinedActions.push({
      label: "Editar",
      icon: Edit,
      onClick: onEdit,
      shortcut: "⌘E",
    });
  }

  if (showCopy && onCopy) {
    predefinedActions.push({
      label: "Copiar",
      icon: Copy,
      onClick: onCopy,
      shortcut: "⌘C",
    });
  }

  if (showDownload && onDownload) {
    predefinedActions.push({
      label: "Descargar",
      icon: Download,
      onClick: onDownload,
      shortcut: "⌘D",
    });
  }

  if (showDelete && onDelete) {
    // Si hay otras acciones y también delete, agregamos un separador
    if (predefinedActions.length > 0) {
      predefinedActions.push({
        label: "--separator--", // Marcador especial para el separador
        onClick: () => {}, // Función vacía
      });
    }

    predefinedActions.push({
      label: "Eliminar",
      icon: Trash,
      onClick: onDelete,
      shortcut: "⌘⌫",
      variant: "destructive",
    });
  }

  // Combinar acciones predefinidas con personalizadas
  const allActions = [...predefinedActions, ...actions];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {allActions.map((action, index) =>
          action.label === "--separator--" ? (
            <DropdownMenuSeparator key={`sep-${index}`} />
          ) : (
            <DropdownMenuItem
              key={`action-${index}`}
              onClick={() => action.onClick(rowData)}
              disabled={action.disabled}
              className={action.variant === "destructive" ? "text-destructive" : ""}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              <span>{action.label}</span>
              {action.shortcut && <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
