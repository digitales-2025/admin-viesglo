"use client";

import Link from "next/link";
import { AlertTriangle, BadgeCheck, LogOut, WifiOff } from "lucide-react";

import { useLogout, useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useMqttConnectionStatus } from "@/shared/stores/mqtt-connection.store";
import { firstLetterName } from "@/shared/utils/firstLetterName";
import { Skeleton } from "../ui/skeleton";

export function ProfileDropdown() {
  const { data: user, isLoading, isAuthenticated, isUnauthenticated, error } = useProfile();
  const { onLogout } = useLogout();
  const connectionStatus = useMqttConnectionStatus();

  const dotColor = connectionStatus === "connected" ? "bg-green-500" : "bg-gray-400";

  // ✅ Solo no mostrar si definitivamente no está autenticado Y no hay errores
  if (isUnauthenticated && !error) {
    return null;
  }

  // ✅ Si está cargando, mostrar skeleton
  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <span className={`absolute -right-1 -top-0.5 h-3 w-3 rounded-full ${dotColor} ring-2 ring-background z-10`} />
          <Avatar className={`h-8 w-8 border-2`}>
            <AvatarFallback className={`rounded-lg uppercase font-bold `}>
              {error ? (
                <AlertTriangle className="h-4 w-4" />
              ) : user?.name ? (
                firstLetterName(user.name)
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize leading-none">{user?.name || "Usuario"}</p>
              {error && <AlertTriangle className="h-3 w-3 text-red-500" />}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs leading-none text-muted-foreground">{user?.email || "Error de conexión"}</p>
              {error && <WifiOff className="h-3 w-3 text-red-500" />}
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-1 p-2 bg-red-50 rounded-md border border-red-200">
                <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 font-medium">Error de autenticación</p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        {isAuthenticated && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/settings/profile">
                  Mi cuenta
                  <DropdownMenuShortcut>
                    <BadgeCheck />
                  </DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} disabled={isLoading}>
          Cerrar sesión
          <DropdownMenuShortcut>
            <LogOut />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
