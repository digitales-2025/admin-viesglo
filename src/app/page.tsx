import { DataTable } from "@/presentation/components/data-table/DataTable";
import AdminLayout from "@/presentation/components/layout/AdminLayout";
import { Header } from "@/presentation/components/layout/Header";
import { ProfileDropdown } from "@/presentation/components/layout/ProfileDropdown";
import { Search } from "@/presentation/components/layout/Search";
import Shell from "@/presentation/components/layout/Shell";
import { ThemeSwitch } from "@/presentation/components/layout/ThemeSwitch";
import { TopNav } from "@/presentation/components/layout/TopNav";

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
