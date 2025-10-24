import Link from "next/link";
import { AlertTriangle, BadgeCheckIcon, ChevronsUpDown, LogOut, WifiOff } from "lucide-react";

import { useLogout, useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
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
import { Skeleton } from "../ui/skeleton";

export function NavUser() {
  const { data: user, isLoading, isAuthenticated, isUnauthenticated, error } = useProfile();
  const { isMobile } = useSidebar();
  const { onLogout } = useLogout();

  // ✅ Solo no mostrar si definitivamente no está autenticado Y no hay errores
  if (isUnauthenticated && !error) {
    return null;
  }

  // ✅ Si está cargando, mostrar skeleton
  if (isLoading) return <Skeleton className="h-10 w-full" />;

  return (
    <>
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
                    {error ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : user?.name ? (
                      firstLetterName(user.name)
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold capitalize">{user?.name || "Usuario"}</span>
                  <span className="truncate text-xs">{user?.email || "Error de conexión"}</span>
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
                      {error ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : user?.name ? (
                        firstLetterName(user.name)
                      ) : (
                        <WifiOff className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold capitalize">{user?.name || "Usuario"}</span>
                    <span className="truncate text-xs">{user?.email || "Error de conexión"}</span>
                    {error && (
                      <div className="flex items-center gap-2 mt-1 p-2 bg-red-50 rounded-md border border-red-200">
                        <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-600 font-medium">Error de autenticación</p>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>

              {isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/admin/settings/profile">
                        <BadgeCheckIcon />
                        Cuenta
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
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
