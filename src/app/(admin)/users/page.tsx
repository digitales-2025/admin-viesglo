import { DataTable } from "@/shared/components/data-table/DataTable";
import Shell from "@/shared/components/layout/Shell";
import { ThemeSwitch } from "@/shared/components/layout/ThemeSwitch";
import { ProfileDropdown } from "@/shared/components/layout/ProfileDropdown";
import { Search } from "@/shared/components/layout/Search";
import { userListSchema } from "./data/schema";
import { UsersPrimaryButtons } from "./_components/UsersButtons";
import { UsersDialogs } from "./_components/UsersDialogs";
import { Header } from "@/shared/components/layout/Header";
import { users } from "./data/users";
import { columns } from "./_components/UsersColumn";

export default function Users() {
  // Parse user list
  const userList = userListSchema.parse(users)

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Shell>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={userList} columns={columns} />
        </div>
      </Shell>

      <UsersDialogs />
    </>
  )
}