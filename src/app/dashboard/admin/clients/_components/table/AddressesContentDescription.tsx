import { useState } from "react";
import { Edit, ExternalLink, MapPin, MoreVertical, Navigation, Plus, RotateCcw, Trash, XCircle } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { cn } from "@/lib/utils";
import LogoGoogleMaps from "@/shared/components/icons/LogoGoogleMaps";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useToggleActiveAddress } from "../../_hooks/use-clients";
import type { ClientAddressResponseDto, ClientProfileResponseDto } from "../../_types/clients.types";
import UpdateAddressDialog from "./edit-address/UpdateAddressDialog";

interface AddressesContentDescriptionProps {
  row: ClientProfileResponseDto;
  setShowAddresses: (expanded: boolean) => void;
}

export default function AddressesContentDescription({ row, setShowAddresses }: AddressesContentDescriptionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ClientAddressResponseDto | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<ClientAddressResponseDto | null>(null);

  const toggleActiveAddress = useToggleActiveAddress();

  const handleToggleStatus = (address: ClientAddressResponseDto) => {
    toggleActiveAddress.mutate({
      params: {
        path: {
          id: row.id,
          addressId: address.id,
        },
      },
    });
  };

  // Handler para abrir el diálogo
  const handleOpenDialog = (address?: ClientAddressResponseDto) => {
    setEditingAddress(address ?? null);
    setIsDialogOpen(true);
  };

  const hasAddresses = row.addresses && row.addresses.length > 0;

  return (
    <div className="bg-card rounded-xl border px-1">
      {/* Header del panel */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {row.addresses?.length ?? 0} {(row.addresses?.length ?? 0) === 1 ? "Dirección" : "Direcciones"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <PermissionProtected
            permissions={[{ resource: EnumResource.clients, action: EnumAction.update }]}
            hideOnUnauthorized={true}
          >
            <Button
              type="button"
              variant="ghost"
              className="ml-1 border border-primary/20 hover:bg-primary/10 gap-1 px-3 py-1.5 text-sm"
              onClick={() => handleOpenDialog()}
              aria-label="Agregar dirección"
            >
              <Plus className="h-4 w-4 text-primary" />
              Agregar
            </Button>
          </PermissionProtected>
          <UpdateAddressDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            editingAddress={editingAddress}
            setEditingAddress={setEditingAddress}
            clientId={row.id}
          />
          <Button
            type="button"
            onClick={() => setShowAddresses(false)}
            className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <XCircle className="h-3 w-3" />
            Ocultar
          </Button>
        </div>
      </div>
      <div className="h-[320px] overflow-hidden">
        <ScrollArea className="max-h-[300px] h-full pb-6">
          {hasAddresses ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 px-6">
              {row.addresses?.map((address, idx) => {
                const addressParts = [address.address, "Perú"].filter(Boolean);
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts.join(", "))}`;

                return (
                  <div key={idx} className="group relative">
                    <div className="px-5 py-3 rounded-xl border bg-gradient-to-br from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-200 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{idx + 1}</span>
                          </div>
                          <span className="font-semibold text-foreground">Dirección {idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              address.isActive ? "bg-emerald-500" : "bg-destructive"
                            )}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <PermissionProtected
                                permissions={[{ resource: EnumResource.clients, action: EnumAction.update }]}
                                hideOnUnauthorized={true}
                              >
                                <DropdownMenuItem onClick={() => handleOpenDialog(address)}>
                                  Editar
                                  <DropdownMenuShortcut>
                                    <Edit className="size-4 mr-2" />
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </PermissionProtected>
                              {address.isActive ? (
                                <PermissionProtected
                                  permissions={[{ resource: EnumResource.clients, action: EnumAction.delete }]}
                                  hideOnUnauthorized={true}
                                >
                                  <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => setAddressToDelete(address)}
                                    disabled={toggleActiveAddress.isPending}
                                  >
                                    Desactivar
                                    <DropdownMenuShortcut>
                                      <Trash className="size-4 mr-2 text-destructive" />
                                    </DropdownMenuShortcut>
                                  </DropdownMenuItem>
                                </PermissionProtected>
                              ) : (
                                <PermissionProtected
                                  permissions={[{ resource: EnumResource.clients, action: EnumAction.reactivate }]}
                                  hideOnUnauthorized={true}
                                >
                                  <DropdownMenuItem
                                    className="cursor-pointer text-primary focus:bg-primary/10"
                                    onClick={() => handleToggleStatus(address)}
                                    disabled={toggleActiveAddress.isPending}
                                  >
                                    Reactivar
                                    <DropdownMenuShortcut>
                                      <RotateCcw className="size-4 mr-2 text-primary" />
                                    </DropdownMenuShortcut>
                                  </DropdownMenuItem>
                                </PermissionProtected>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg border mb-3 overflow-hidden">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3 hover:bg-muted/30 transition-colors group/link"
                          title={`Ver en Google Maps: ${address.address}`}
                        >
                          <div className="flex justify-between gap-3">
                            <div className="flex items-start gap-3 group-hover/link:opacity-90 transition-opacity">
                              <div className="flex-shrink-0 mt-0.5">
                                <LogoGoogleMaps className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Dirección
                                  </p>
                                </div>
                                <p className="font-medium text-foreground break-words whitespace-normal leading-relaxed group-hover/link:text-primary transition-colors">
                                  {address.address}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 group-hover/link:text-primary/70 transition-colors">
                                  Hacer clic para ver en Google Maps
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </div>
                          {address.reference && (
                            <div className="mt-4">
                              <div className="flex items-start gap-2">
                                <Navigation className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Referencia
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{address.reference}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <XCircle className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm mb-4">
                <h4 className="font-semibold text-foreground">No hay direcciones registradas</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este cliente no tiene direcciones adicionales registradas en el sistema
                </p>
              </div>
              <PermissionProtected
                permissions={[{ resource: EnumResource.clients, action: EnumAction.update }]}
                hideOnUnauthorized={true}
              >
                <Button size="sm" onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Dirección
                </Button>
              </PermissionProtected>
            </div>
          )}
        </ScrollArea>
      </div>
      {addressToDelete && (
        <ConfirmDialog
          key="address-delete"
          open={!!addressToDelete}
          onOpenChange={(open) => {
            if (!open) setAddressToDelete(null);
          }}
          handleConfirm={() => {
            handleToggleStatus(addressToDelete);
            setAddressToDelete(null);
          }}
          title={
            <div className="flex items-center gap-2">
              <Trash className="h-4 w-4 text-rose-500" />
              Desactivar dirección
            </div>
          }
          desc={
            <>
              Estás a punto de desactivar la dirección:
              <br />
              <strong className="uppercase text-wrap">{addressToDelete?.address}</strong>.<br />
              Esta acción puede revertirse reactivando la dirección.
            </>
          }
          confirmText="Desactivar"
          cancelBtnText="Cancelar"
          destructive
          isLoading={toggleActiveAddress.isPending}
        />
      )}
    </div>
  );
}
