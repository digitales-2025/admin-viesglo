import { Metadata } from "next";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import UsersDialogs from "./_components/UsersDialogs";
import UsersPrimaryButtons from "./_components/UsersPrimaryButtons";
import UsersTable from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Administrador de usuarios",
};

export default function UsersPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Administrador de usuarios" description="Gestiona los usuarios aquí." />
        <UsersPrimaryButtons />
      </ShellHeader>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <UsersTable />
        <UsersDialogs />
      </div>
    </>
  );
}
