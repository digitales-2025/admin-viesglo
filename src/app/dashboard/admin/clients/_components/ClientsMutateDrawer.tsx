"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  FileText,
  Mail,
  MapPin,
  Plus,
  Send,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";

import UbigeoSelect from "@/shared/components/UbigeoSelect";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useClientForm, type CreateClientFormData } from "../_hooks/use-client-form";
import { useCreateClient, useUpdateClient } from "../_hooks/use-clients";
import { ClientOperationResponseDto } from "../_types/clients.types";
import LookupRuc from "./search-ruc/LookupRuc";

interface ClientsMutateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ClientOperationResponseDto;
}

export function ClientsMutateDrawer({ open, onOpenChange, currentRow }: ClientsMutateDrawerProps) {
  const [contactsExpanded, setContactsExpanded] = useState(true);
  const [sunatExpanded, setSunatExpanded] = useState(true);

  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const isPending = isCreating || isUpdating;

  const isUpdate = !!currentRow;

  const { form, addContact, removeContact, getSubmitData } = useClientForm({
    isUpdate: isUpdate,
    initialData: currentRow,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CreateClientFormData) => {
    const submitData = getSubmitData(data);

    if (isUpdate && currentRow) {
      updateClient(
        { id: currentRow.id, data: submitData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createClient(submitData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  const contacts = form.watch("contacts") || [];

  return (
    <GenericSheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
      title={`${isUpdate ? "Actualizar" : "Crear"} cliente`}
      description={isUpdate ? "Actualiza los datos del cliente" : "Crea un nuevo cliente con su información completa"}
      maxWidth="xl"
      titleClassName="text-2xl font-bold capitalize"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button form="client-form" type="submit" disabled={isPending}>
            {isPending ? (
              "Guardando..."
            ) : isUpdate ? (
              <>
                Actualizar cliente
                <Send className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Crear cliente
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      }
    >
      <Form {...form}>
        <form id="client-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
          {/* Información Básica */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              <h3>Información Básica</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="ruc"
                render={() => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      RUC
                    </FormLabel>
                    <FormControl>
                      <LookupRuc form={form} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      Razón Social
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="EMPRESA S.A.C." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalRepresentative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      Representante Legal
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Contactos */}
          <section className="space-y-4">
            <button
              type="button"
              onClick={() => setContactsExpanded(!contactsExpanded)}
              className="w-full flex items-center justify-between pb-2 border-b hover:border-foreground/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <h3>Contactos</h3>
                {contacts.length > 0 && (
                  <Badge variant="outline" className="rounded-full">
                    {contacts.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${contactsExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {contactsExpanded && (
              <div className="space-y-4">
                {contacts.map((_, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-6 top-0 w-px h-full bg-border" />
                    <div className="space-y-4 p-4 border border-dashed rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Contacto {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="María López" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">Cargo</FormLabel>
                              <FormControl>
                                <Input placeholder="Gerente Comercial" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">Teléfono</FormLabel>
                              <FormControl>
                                <PhoneInput defaultCountry="PE" placeholder="+51987654321" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`contacts.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="maria@empresa.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addContact}
                  className="w-full border-dashed hover:bg-muted/50 bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Contacto
                </Button>
              </div>
            )}
          </section>

          {/* Información SUNAT */}
          <section className="space-y-4">
            <button
              type="button"
              onClick={() => setSunatExpanded(!sunatExpanded)}
              className="w-full flex items-center justify-between pb-2 border-b hover:border-foreground/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3>Información SUNAT</h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${sunatExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {sunatExpanded && (
              <div className="space-y-4">
                <div className="absolute -left-6 top-0 w-px h-full bg-border" />
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="sunatInfo.businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón Social SUNAT</FormLabel>
                        <FormControl>
                          <Input placeholder="EMPRESA S.A.C." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sunatInfo.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="ACTIVO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sunatInfo.condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condición</FormLabel>
                      <FormControl>
                        <Input placeholder="HABIDO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sunatInfo.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección Fiscal</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Principal 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sunatInfo.fullAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección Completa</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Principal 123, Lima, Lima" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <UbigeoSelect
                    control={form.control}
                    initialValues={{
                      department: form.getValues("sunatInfo.department"),
                      province: form.getValues("sunatInfo.province"),
                      district: form.getValues("sunatInfo.district"),
                    }}
                    required={true}
                    // Mapea los nombres del formulario a los de sunatInfo
                    onChange={{
                      department: (value) => form.setValue("sunatInfo.department", value),
                      province: (value) => form.setValue("sunatInfo.province", value),
                      district: (value) => form.setValue("sunatInfo.district", value),
                    }}
                  />
                </div>
              </div>
            )}
          </section>
        </form>
      </Form>
    </GenericSheet>
  );
}
