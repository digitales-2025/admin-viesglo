import { Briefcase, Hash, Loader2, Mail, MapPin, Phone } from "lucide-react";

import { useClientById } from "@/app/dashboard/admin/clients/_hooks/use-clients";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card";
import { cn } from "@/shared/lib/utils";

interface HoverCardClientProps {
  clientId: string;
  clientName: string;
  className?: string;
}

export default function HoverCardClient({ clientId, clientName, className }: HoverCardClientProps) {
  const { query } = useClientById(clientId);
  const { data: client, isLoading, error } = query;

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
            <Briefcase className="size-4 text-muted-foreground" strokeWidth={1} />
          </div>
          <span className="truncate">{clientName}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0 overflow-hidden">
        <div className="relative">
          {/* Estado de carga */}
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 text-muted-foreground animate-spin" strokeWidth={1} />
                <span className="text-sm text-muted-foreground">Cargando información del cliente...</span>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && (
            <div className="p-4 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-destructive" strokeWidth={1} />
                <span className="text-sm text-destructive">Error al cargar información del cliente</span>
              </div>
            </div>
          )}

          {/* Contenido del cliente */}
          {client && (
            <>
              {/* Encabezado minimalista */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-4 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground capitalize leading-tight truncate">
                      {client.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Cliente empresa</p>
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="p-4 space-y-4">
                {/* Identificación y contacto */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                    <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">RUC</p>
                      <p className="text-sm font-mono text-foreground">{client._ruc?.value || "—"}</p>
                    </div>
                  </div>

                  {/* Mostrar teléfono del primer contacto si existe */}
                  {client.contacts && client.contacts.length > 0 && client.contacts[0]._phone?.value && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                      <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Teléfono</p>
                        <p className="text-sm text-foreground">{client.contacts[0]._phone.value}</p>
                      </div>
                    </div>
                  )}

                  {/* Mostrar email del cliente */}
                  {client._email?.value && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                      <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground truncate">{client._email.value}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dirección principal */}
                {client.addresses && client.addresses.length > 0 && client.addresses[0].address && (
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted">
                    <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center mt-0.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Dirección</p>
                      <p className="text-sm text-foreground leading-relaxed">{client.addresses[0].address}</p>
                      {client.addresses[0].reference && (
                        <p className="text-xs text-muted-foreground mt-1">Ref: {client.addresses[0].reference}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Representante legal */}
                {client.legalRepresentative && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted">
                    <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Representante Legal</p>
                      <p className="text-sm text-foreground">{client.legalRepresentative}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
