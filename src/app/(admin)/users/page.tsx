import { DataTable } from "@/shared/components/data-table/DataTable";
import { Header } from "@/shared/components/layout/Header";
import { ProfileDropdown } from "@/shared/components/layout/ProfileDropdown";
import { Search } from "@/shared/components/layout/Search";
import Shell from "@/shared/components/layout/Shell";
import { ThemeSwitch } from "@/shared/components/layout/ThemeSwitch";
import { UsersPrimaryButtons } from "./_components/UsersButtons";
import { columns } from "./_components/UsersColumn";

export default function Users() {
  const userList: any[] = [];
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Shell>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestión de usuarios</h2>
            <p className="text-muted-foreground">Gestiona a los usuarios del sistema.</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DataTable data={userList} columns={columns} />
        </div>
      </Shell>
    </>
  );
}
