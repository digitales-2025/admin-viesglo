import { DataTable } from "@/shared/components/data-table/DataTable";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import { Header } from "@/shared/components/layout/Header";
import { ProfileDropdown } from "@/shared/components/layout/ProfileDropdown";
import { Search } from "@/shared/components/layout/Search";
import Shell from "@/shared/components/layout/Shell";
import { ThemeSwitch } from "@/shared/components/layout/ThemeSwitch";
import { TopNav } from "@/shared/components/layout/TopNav";

const topNav = [
  {
    title: "Overview",
    href: "dashboard/overview",
    isActive: true,
    disabled: false,
  },
  {
    title: "Customers",
    href: "dashboard/customers",
    isActive: false,
    disabled: true,
  },
  {
    title: "Products",
    href: "dashboard/products",
    isActive: false,
    disabled: true,
  },
  {
    title: "Settings",
    href: "dashboard/settings",
    isActive: false,
    disabled: true,
  },
];

export default function Home() {
  return (
    <AdminLayout>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      {/* ===== Main Content ===== */}
      <Shell>
        <DataTable columns={[]} data={[]} />
      </Shell>
    </AdminLayout>
  );
}
