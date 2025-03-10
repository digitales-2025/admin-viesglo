import { DataTable } from "@/shared/components/data-table/DataTable";
import Shell from "@/shared/components/layout/Shell";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<{ name: string; surnames: string; email: string; phone: string; post: string; role: string }>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "surnames",
    header: "Apellidos",
  },
  {
    accessorKey: "email",
    header: "Correo Electrónico",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "post",
    header: "Cargo",
  },
  {
    accessorKey: "role",
    header: "Rol",
  },
];

const data = [
  { name: "Juan", surnames: "Perez", email: "juan@example.com", phone: "123456789", post: "Consultor de Salud Ocupacional", role: "Consultor" },
];

export default function PageUsers() {
  return (
    <Shell>
      <div className="space-y-2">
        <div className="text-2xl font-bold">
          <h1>Lista de Usuarios</h1>
        </div>
        <p className="text-xs">Gestiona a los usuarios del sistema</p>
      </div>
      <DataTable columns={columns} data={data}></DataTable>
    </Shell>
  );
}
