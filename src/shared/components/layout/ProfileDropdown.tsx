"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, LogOut } from "lucide-react";

import { useCurrentUser, useLogout } from "@/app/(auth)/sign-in/_hooks/useAuth";
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
import { useToast } from "@/shared/hooks/use-toast";
import { firstLetterName } from "@/shared/utils/firstLetterName";
import { LoadingTransition } from "../ui/loading-transition";
import { Skeleton } from "../ui/skeleton";
import { User } from "./data/types";

export function ProfileDropdown() {
  const { success, error } = useToast();
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser<User>();

  // Añadimos estado para la redirección
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { mutate: logout, isPending: isLoading } = useLogout();

  const handleLogout = async () => {
    logout(undefined, {
      onSuccess: () => {
        setIsRedirecting(true);
        success("Sesión cerrada correctamente");

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
      {isLoadingUser ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{firstLetterName(user?.fullName || "")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  Mi cuenta
                  <DropdownMenuShortcut>
                    <BadgeCheck />
                  </DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
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
