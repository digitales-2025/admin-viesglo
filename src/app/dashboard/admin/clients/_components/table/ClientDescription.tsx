"use client";

import { useState } from "react";
import { Building2, CheckCircle, Globe, Mail, MapPin, Shield, User, XCircle } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { cn } from "@/lib/utils";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { ClientProfileResponseDto } from "../../_types/clients.types";
import { clientConditionConfig, clientStateConfig, getInitials } from "../../_utils/clients.utils";
import AddressesContentDescription from "./AddressesContentDescription";
import ContactContentDescription from "./ContactContentDescription";

interface ClientDescriptionProps {
  row: ClientProfileResponseDto;
}

export const ClientDescription = ({ row }: ClientDescriptionProps) => {
  const [showAddresses, setShowAddresses] = useState(false);

  return (
    <div className="w-full space-y-4 py-2 px-6">
      {/* Header Section - Diseño horizontal minimalista */}
      <div className="flex items-center justify-between p-6 bg-card rounded-2xl border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                {getInitials(row.name)}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -top-0 -right-1 h-5 w-5 rounded-full border-2 border-background",
                row.isActive ? "bg-emerald-500" : "bg-destructive"
              )}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{row.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {row._ruc.value}
              </span>
              {row.legalRepresentative && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {row.legalRepresentative}
                </span>
              )}
            </div>
          </div>
        </div>
        <Badge variant={row.isActive ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
          {row.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {row.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Main Content - Layout tipo dashboard */}
      <div className="grid grid-cols-12 gap-6">
        {/* Columna izquierda - Info principal */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Información de contacto - Diseño horizontal */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Contacto Principal</h3>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{row._email.value}</p>
                  <p className="text-sm text-muted-foreground">Email corporativo</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                {row._email.domain}
              </Badge>
            </div>
          </div>

          {/* Información SUNAT - Diseño en filas */}
          {row.sunatInfo && (
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Datos SUNAT</h3>
              </div>
              <div className="space-y-4">
                {/* Fila 1: Estado y Condición */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Estado</span>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 px-2 py-0.5 ${clientStateConfig[row.sunatInfo.state]?.textClass ?? ""} ${clientStateConfig[row.sunatInfo.state]?.borderColor ?? ""}`}
                    >
                      {clientStateConfig[row.sunatInfo.state]?.icon &&
                        (() => {
                          const Icon = clientStateConfig[row.sunatInfo.state].icon;
                          return (
                            <Icon className={`h-3 w-3 ${clientStateConfig[row.sunatInfo.state]?.iconClass ?? ""}`} />
                          );
                        })()}
                      {clientStateConfig[row.sunatInfo.state]?.label ?? row.sunatInfo.state}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Condición</span>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 px-2 py-0.5 ${clientConditionConfig[row.sunatInfo.condition]?.textClass ?? ""} ${clientConditionConfig[row.sunatInfo.condition]?.borderColor ?? ""}`}
                    >
                      {clientConditionConfig[row.sunatInfo.condition]?.icon &&
                        (() => {
                          const Icon = clientConditionConfig[row.sunatInfo.condition].icon;
                          return (
                            <Icon
                              className={`h-3 w-3 ${clientConditionConfig[row.sunatInfo.condition]?.iconClass ?? ""}`}
                            />
                          );
                        })()}
                      {clientConditionConfig[row.sunatInfo.condition]?.label ?? row.sunatInfo.condition}
                    </Badge>
                  </div>
                </div>

                {/* Fila 2: Razón Social */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Razón Social
                      </p>
                      <p className="font-medium">{row.sunatInfo.businessName}</p>
                    </div>
                  </div>
                </div>

                {/* Fila 3: Dirección */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Dirección Fiscal
                      </p>
                      <div>
                        <p className="font-medium mb-2 break-words whitespace-normal">{row.sunatInfo.fullAddress}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs px-2 py-1 bg-background rounded border">{row.sunatInfo.district}</span>
                        <span className="text-xs px-2 py-1 bg-background rounded border">{row.sunatInfo.province}</span>
                        <span className="text-xs px-2 py-1 bg-background rounded border">
                          {row.sunatInfo.department}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - Contactos */}
        <ContactContentDescription row={row} />
      </div>

      {/* Botón para mostrar direcciones - Nueva ubicación */}
      {!showAddresses && (
        <PermissionProtected
          permissions={[{ resource: EnumResource.clients, action: EnumAction.read }]}
          hideOnUnauthorized={true}
        >
          <div className="flex justify-center">
            <Button type="button" onClick={() => setShowAddresses(true)}>
              <MapPin className="h-4 w-4" />
              Ver Direcciones del Cliente
              {row.addresses && row.addresses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {row.addresses.length}
                </Badge>
              )}
            </Button>
          </div>
        </PermissionProtected>
      )}

      {/* Panel de direcciones mejorado */}
      {showAddresses && <AddressesContentDescription row={row} setShowAddresses={setShowAddresses} />}
    </div>
  );
};
