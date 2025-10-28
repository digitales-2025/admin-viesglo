"use client";

import Link from "next/link";
import { BadgeCheck, LogOut } from "lucide-react";

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
  const { data: user, isLoading, isAuthenticated, isUnauthenticated } = useProfile();
  const { onLogout } = useLogout();
  const connectionStatus = useMqttConnectionStatus();

  const dotColor = connectionStatus === "connected" ? "bg-green-500" : "bg-gray-400";

  // ✅ Si no está autenticado, no mostrar el dropdown
  if (isUnauthenticated || (!isLoading && !isAuthenticated)) {
    return null;
  }

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <span
                className={`absolute -right-1 -top-0.5 h-3 w-3 rounded-full ${dotColor} ring-2 ring-background z-10`}
              />
              <Avatar className="h-8 w-8">
                <AvatarFallback className="rounded-lg uppercase font-bold">
                  {firstLetterName(user?.name || "")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold capitalize leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} disabled={isLoading}>
              Cerrar sesión
              <DropdownMenuShortcut>
                <LogOut />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
