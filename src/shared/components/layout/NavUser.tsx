import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheckIcon, ChevronsUpDown, LogOut } from "lucide-react";

import { useLogout } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { components } from "@/lib/api/types/api";
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
import { useToast } from "@/shared/hooks/use-toast";
import { firstLetterName } from "@/shared/utils/firstLetterName";
import { LoadingTransition } from "../ui/loading-transition";

type User = components["schemas"]["UserResponseDto"];

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();

  const { success, error } = useToast();
  const router = useRouter();

  // Añadimos estado para la redirección
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { mutate: logout, isPending: isLoading } = useLogout();

  const handleLogout = async () => {
    // Es crucial que el logout se haga desde el cliente (navegador)
    // para que el backend pueda borrar las cookies del navegador
    logout(undefined, {
      onSuccess: () => {
        setIsRedirecting(true);
        success("Sesión cerrada correctamente");

        // Esperar un poco para asegurar que las cookies se limpien
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      },
      onError: () => {
        error("Error al cerrar sesión");
      },
    });
  };

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
                  <AvatarFallback className="rounded-lg">{firstLetterName(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.fullName}</span>
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
                    <AvatarFallback className="rounded-lg">SN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.fullName}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings/account">
                    <BadgeCheckIcon />
                    Account
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
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
