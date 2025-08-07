import { Metadata } from "next";

import RolesOverlays from "./_components/roles-overlays/RolesOverlays";
import RolesPrimaryButtons from "./_components/table/RolesPrimaryButtons";
import { RolesTable } from "./_components/table/RolesTable";

export const metadata: Metadata = {
  title: "Administrador de roles",
};

export default function RolesPage() {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administrador de roles</h2>
          <p className="text-muted-foreground">Gestiona los roles de los usuarios aquí.</p>
        </div>
        <RolesPrimaryButtons />
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <RolesTable />
      </div>
      <RolesOverlays />
    </>
  );
}
