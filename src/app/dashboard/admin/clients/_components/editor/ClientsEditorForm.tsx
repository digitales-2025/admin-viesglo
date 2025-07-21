import {
  BadgeCheck,
  Building2,
  ChevronDown,
  FileText,
  Landmark,
  Mail,
  Map,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import UbigeoSelect from "@/shared/components/UbigeoSelect";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { CreateClientFormData } from "../../_schemas/clients.schemas";
import LookupRuc from "../search-ruc/LookupRuc";

interface ClientsEditorFormProps {
  form: UseFormReturn<CreateClientFormData>;
  onSubmit: (data: CreateClientFormData) => void;
  sunatExpanded: boolean;
  setSunatExpanded: (expanded: boolean) => void;
  contactsExpanded: boolean;
  setContactsExpanded: (expanded: boolean) => void;
  isUpdate: boolean;
  removeContact: (index: number) => void;
  addContact: () => void;
}

export default function ClientsEditorForm({
  form,
  onSubmit,
  sunatExpanded,
  setSunatExpanded,
  contactsExpanded,
  setContactsExpanded,
  isUpdate,
  removeContact,
  addContact,
}: ClientsEditorFormProps) {
  const contacts = form.watch("contacts") || [];

  return (
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
          <div className="px-2 space-y-4">
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
                      <LookupRuc form={form} isUpdate={isUpdate} />
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
          </div>
        </section>

        {/* Contactos */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setContactsExpanded(!contactsExpanded)}
            className="w-full flex items-center justify-between pb-2 border-b"
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
                <div key={index} className="relative px-2">
                  <div className="absolute -left-6 top-0 w-px h-full bg-border" />
                  <div className="space-y-4 p-4 border border-dashed rounded-lg bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground/95">Contacto {index + 1}</span>
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
            className="w-full flex items-center justify-between pb-2 border-b"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
              <h3>Información SUNAT</h3>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${sunatExpanded ? "rotate-180" : ""}`} />
          </button>

          {sunatExpanded && (
            <div className="space-y-4 px-2">
              <div className="absolute -left-6 top-0 w-px h-full bg-border" />
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="sunatInfo.businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        Razón Social SUNAT
                      </FormLabel>
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
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                        Estado
                      </FormLabel>
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
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                      Condición
                    </FormLabel>
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
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        Dirección Fiscal
                      </FormLabel>
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
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Map className="h-4 w-4 text-muted-foreground shrink-0" />
                        Dirección Completa
                      </FormLabel>
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
                  fieldNames={{
                    department: "sunatInfo.department",
                    province: "sunatInfo.province",
                    district: "sunatInfo.district",
                  }}
                  required={true}
                  icons={{
                    department: <Landmark className="h-4 w-4 text-muted-foreground" />,
                    province: <MapPin className="h-4 w-4 text-muted-foreground" />,
                    district: <Map className="h-4 w-4 text-muted-foreground" />,
                  }}
                />
              </div>
            </div>
          )}
        </section>
      </form>
    </Form>
  );
}
