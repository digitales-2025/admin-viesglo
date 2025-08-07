import { Metadata } from "next";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import RolesOverlays from "./_components/roles-overlays/RolesOverlays";
import RolesPrimaryButtons from "./_components/table/RolesPrimaryButtons";
import { RolesTable } from "./_components/table/RolesTable";

export const metadata: Metadata = {
  title: "Administrador de roles",
};

export default function RolesPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Gestión de Roles"
          description="Administre, registre y consulte la información de sus roles desde este panel."
        />
        <RolesPrimaryButtons />
      </ShellHeader>
      <RolesTable />
      <RolesOverlays />
    </>
  );
}
