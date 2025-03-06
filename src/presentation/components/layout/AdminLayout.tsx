import Cookies from "js-cookie";

import { SearchProvider } from "@/shared/context/search-context";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import SkipToMain from "./SkipToMain";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        {children}
      </SidebarProvider>
    </SearchProvider>
  );
}
