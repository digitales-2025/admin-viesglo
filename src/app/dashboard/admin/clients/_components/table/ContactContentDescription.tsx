"use client";

import { useState } from "react";
import { Edit, Mail, MoreVertical, Phone, Plus, RotateCcw, Trash, UserPlus, Users } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { cn } from "@/lib/utils";
import LogoWhatsapp from "@/shared/components/icons/LogoWhatsapp";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useToggleActiveContact } from "../../_hooks/use-clients";
import type { ClientContactResponseDto, ClientProfileResponseDto } from "../../_types/clients.types";
import { getInitials } from "../../_utils/clients.utils";
import UpdateContactDialog from "./edit-contact/UpdateContactDialog";

interface ContactContentDescriptionProps {
  row: ClientProfileResponseDto;
}

export default function ContactContentDescription({ row }: ContactContentDescriptionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContactResponseDto | null>(null);
  const [contactToDelete, setContactToDelete] = useState<ClientContactResponseDto | null>(null);

  const toggleActiveContact = useToggleActiveContact();

  const handleToggleStatus = (contact: ClientContactResponseDto) => {
    toggleActiveContact.mutate({
      params: {
        path: {
          id: row.id,
          email: contact._email.value,
        },
      },
    });
  };

  // Handler para abrir el diálogo
  const handleOpenDialog = (contact?: ClientContactResponseDto) => {
    setEditingContact(contact ?? null);
    setIsDialogOpen(true);
  };

  const hasContacts = row.contacts && row.contacts.length > 0;

  return (
    <div className="col-span-12 lg:col-span-4">
      <div className="bg-card rounded-xl border px-1 h-[555px] overflow-hidden">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {row.contacts?.length ?? 0} Contacto{(row.contacts?.length ?? 0) > 1 ? "s" : ""}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <PermissionProtected
              permissions={[{ resource: EnumResource.clients, action: EnumAction.update }]}
              hideOnUnauthorized={true}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-1 border border-primary/20 hover:bg-primary/10"
                      onClick={() => handleOpenDialog()}
                      aria-label="Agregar contacto"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Agregar contacto</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PermissionProtected>
            <UpdateContactDialog
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              editingContact={editingContact}
              setEditingContact={setEditingContact}
              clientId={row.id}
            />
          </div>
        </div>
        <ScrollArea className="max-h-[450px] h-full">
          {hasContacts ? (
            <div className="space-y-3 px-6 pb-2">
              {row.contacts?.map((contact) => (
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
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              contact.isActive ? "bg-emerald-500" : "bg-destructive"
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
                                <DropdownMenuItem onClick={() => handleOpenDialog(contact)}>
                                  Editar
                                  <DropdownMenuShortcut>
                                    <Edit className="size-4 mr-2" />
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </PermissionProtected>
                              {contact.isActive ? (
                                <PermissionProtected
                                  permissions={[{ resource: EnumResource.clients, action: EnumAction.delete }]}
                                  hideOnUnauthorized={true}
                                >
                                  <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => setContactToDelete(contact)}
                                    disabled={toggleActiveContact.isPending}
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
                                    onClick={() => handleToggleStatus(contact)}
                                    disabled={toggleActiveContact.isPending}
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-sm mb-2">No hay contactos</h4>
              <p className="text-xs text-muted-foreground mb-4">Agrega el primer contacto para este cliente</p>
              <PermissionProtected
                permissions={[{ resource: EnumResource.clients, action: EnumAction.update }]}
                hideOnUnauthorized={true}
              >
                <Button size="sm" onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Contacto
                </Button>
              </PermissionProtected>
            </div>
          )}
        </ScrollArea>
        {contactToDelete && (
          <ConfirmDialog
            key="contact-delete"
            open={!!contactToDelete}
            onOpenChange={(open) => {
              if (!open) setContactToDelete(null);
            }}
            handleConfirm={() => {
              handleToggleStatus(contactToDelete);
              setContactToDelete(null);
            }}
            title={
              <div className="flex items-center gap-2">
                <Trash className="h-4 w-4 text-rose-500" />
                Desactivar contacto
              </div>
            }
            desc={
              <>
                Estás a punto de desactivar el contacto{" "}
                <strong className="uppercase text-wrap">{contactToDelete?.name}</strong>.<br />
                Esta acción puede revertirse reactivando el contacto.
              </>
            }
            confirmText="Desactivar"
            cancelBtnText="Cancelar"
            destructive
            isLoading={toggleActiveContact.isPending}
          />
        )}
      </div>
    </div>
  );
}
