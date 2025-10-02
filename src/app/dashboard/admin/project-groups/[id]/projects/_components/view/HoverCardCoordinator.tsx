import { Hash, Loader2, Mail, User } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card";
import { cn } from "@/shared/lib/utils";
import { useUserById } from "../../../../../users/_hooks/use-users";
import { translateResource } from "../../../../../users/_utils/user.utils";

interface HoverCardCoordinatorProps {
  userId: string;
  userName: string;
  className?: string;
}

export default function HoverCardCoordinator({ userId, userName, className }: HoverCardCoordinatorProps) {
  const query = useUserById(userId);
  const { data: user, isLoading, error } = query;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "font-semibold border border-slate-500/10 rounded-md p-1 capitalize min-w-[150px] max-w-[200px] truncate flex items-center gap-2 hover:bg-muted/30 transition-colors hover:cursor-help",
            className
          )}
        >
          <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center shrink-0">
            <User className="size-4 text-muted-foreground" strokeWidth={1} />
          </div>
          <span className="truncate">{userName}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0 overflow-hidden">
        <div className="relative">
          {/* Estado de carga */}
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 text-muted-foreground animate-spin" strokeWidth={1} />
                <span className="text-sm text-muted-foreground">Cargando información del usuario...</span>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && (
            <div className="p-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <User className="size-4 text-destructive" strokeWidth={1} />
                <span className="text-sm text-destructive">Error al cargar información del usuario</span>
              </div>
            </div>
          )}

          {/* Contenido del usuario */}
          {user && (
            <>
              {/* Encabezado minimalista */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground capitalize leading-tight truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Responsable</p>
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-4 space-y-4">
                {/* Identificación y contacto */}
                <div className="space-y-3">
                  {/* Rol del usuario */}
                  {user.role && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                      <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Rol</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {translateResource(user.role.name.toLowerCase())}
                          </Badge>
                        </div>
                        {user.role.description && (
                          <p className="text-xs text-muted-foreground mt-1">{user.role.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email del usuario */}
                  {user.email && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                      <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Estado del usuario */}
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                    <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Estado</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={user.isActive ? "default" : "destructive"}
                          className={`text-xs ${user.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}`}
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                            Email Verificado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
