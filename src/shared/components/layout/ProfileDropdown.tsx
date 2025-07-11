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
import { firstLetterName } from "@/shared/utils/firstLetterName";
import { Skeleton } from "../ui/skeleton";

export function ProfileDropdown() {
  const { data: user, isLoading } = useProfile();
  const { onLogout } = useLogout();

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-8 w-8 rounded-full" />
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                  <Link href="/settings">
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
