import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheckIcon, ChevronsUpDown, LogOut } from "lucide-react";

import { logout } from "@/app/(auth)/sign-in/_actions/auth.actions";
import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/shared/components/ui/sidebar";
import { firstLetterName } from "@/shared/utils/firstLetterName";
import { LoadingTransition } from "../ui/loading-transition";
import { Skeleton } from "../ui/skeleton";

export function NavUser() {
  const { data: user, isLoading } = useCurrentUser();
  const { isMobile } = useSidebar();

  const router = useRouter();

  // Añadimos estado para la redirección
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsRedirecting(true);
      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch (error) {
      console.error("Error durante el logout:", error);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  return (
    <>
      <LoadingTransition show={isRedirecting} message="Cerrando sesión, por favor espere..." />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg uppercase font-bold">
                    {firstLetterName(user.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold capitalize">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg uppercase font-bold">
                      {firstLetterName(user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold capitalize">{user?.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              {user.type === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/account">
                        <BadgeCheckIcon />
                        Account
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
