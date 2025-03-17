import { Metadata } from "next";

import UsersDialogs from "./_components/UsersDialogs";
import UsersPrimaryButtons from "./_components/UsersPrimaryButtons";
import UsersTable from "./_components/UserTable";

export const metadata: Metadata = {
  title: "Administrador de usuarios",
};

export default function UsersPage() {
  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administrador de usuarios</h2>
          <p className="text-muted-foreground">Gestiona los usuarios aquí.</p>
        </div>
        <UsersPrimaryButtons />
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <UsersTable />
      </div>
      <UsersDialogs />
    </>
  );
}
