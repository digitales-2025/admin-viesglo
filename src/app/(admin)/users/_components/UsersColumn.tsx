import { ColumnDef } from "@tanstack/react-table";

import { User } from "../_data/schema";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "Nombre",
  },
  {
    accessorKey: "Apellido",
  },
  {
    accessorKey: "Correo Electrónico",
  },
  {
    accessorKey: "Teléfono",
  },
  {
    accessorKey: "Cargo",
  },
  {
    accessorKey: "Rol",
  },
];
