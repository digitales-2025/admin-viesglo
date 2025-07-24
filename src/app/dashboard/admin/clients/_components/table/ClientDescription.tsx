"use client";

import { Building2, CheckCircle, Globe, Mail, MapPin, Phone, Shield, User, Users, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import LogoWhatsapp from "@/shared/components/icons/LogoWhatsapp";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ClientProfileResponseDto } from "../../_types/clients.types";

interface ClientDescriptionProps {
  row: ClientProfileResponseDto;
}

export const ClientDescription = ({ row }: ClientDescriptionProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

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
                      className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                    >
                      {row.sunatInfo.state}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Condición</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    >
                      {row.sunatInfo.condition}
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
                      <p className="font-medium mb-2">{row.sunatInfo.fullAddress}</p>
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
        <div className="col-span-12 lg:col-span-4">
          {row.contacts && row.contacts.length > 0 && (
            <div className="bg-card rounded-xl border px-1 h-[555px] overflow-hidden">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Contactos</h3>
                </div>
                <Badge variant="default" className="text-xs">
                  {row.contacts.length}
                </Badge>
              </div>
              <ScrollArea className="max-h-[450px] h-full">
                <div className="space-y-3 px-6 pb-2">
                  {row.contacts.map((contact) => (
                    <div key={contact.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback className="bg-muted text-xs font-medium">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm truncate">{contact.name}</p>
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                contact.isActive ? "bg-emerald-500" : "bg-destructive"
                              )}
                            />
                          </div>

                          <p className="text-xs text-muted-foreground mb-3 truncate">{contact.position}</p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <a
                                href={`tel:${contact._phone.value.replace(/[^0-9]/g, "")}`}
                                className="truncate hover:underline text-primary"
                                title={`Llamar a ${contact._phone.value}`}
                              >
                                {contact._phone.value}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <a
                                href={`mailto:${contact._email.value}`}
                                className="truncate hover:underline text-primary"
                                title={`Enviar correo a ${contact._email.value}`}
                              >
                                {contact._email.value}
                              </a>
                            </div>

                            {/* Botón WhatsApp */}
                            <a
                              href={`https://wa.me/${contact._phone.value.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
                              title="Chatear por WhatsApp"
                            >
                              <LogoWhatsapp className="h-4 w-4" />
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
