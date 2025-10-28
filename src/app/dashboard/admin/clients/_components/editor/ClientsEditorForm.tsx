import { Building2, ChevronDown, FileText, Mail, MapPin, UserCheck, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { CreateClientFormData } from "../../_schemas/clients.schemas";
import LookupRuc from "../search-ruc/LookupRuc";
import ClientsAddressesForm from "./ClientsAddressesForm";
import ClientsContactsForm from "./ClientsContactsForm";
import ClientsSunatInformationForm from "./ClientsSunatInformationForm";

interface ClientsEditorFormProps {
  form: UseFormReturn<CreateClientFormData>;
  onSubmit: (data: CreateClientFormData) => void;
  sunatExpanded: boolean;
  setSunatExpanded: (expanded: boolean) => void;
  contactsExpanded: boolean;
  setContactsExpanded: (expanded: boolean) => void;
  addressesExpanded: boolean;
  setAddressesExpanded: (expanded: boolean) => void;
  isUpdate: boolean;
  removeContact: (index: number) => void;
  addContact: () => void;
  removeAddress: (index: number) => void;
  addAddress: () => void;
}

export default function ClientsEditorForm({
  form,
  onSubmit,
  sunatExpanded,
  setSunatExpanded,
  contactsExpanded,
  setContactsExpanded,
  addressesExpanded,
  setAddressesExpanded,
  isUpdate,
  removeContact,
  addContact,
  removeAddress,
  addAddress,
}: ClientsEditorFormProps) {
  const contacts = form.watch("contacts") || [];

  const addresses = form.watch("addresses") || [];

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
                      <span className="text-red-500">*</span>
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
                      <span className="text-red-500">*</span>
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
                      <span className="text-red-500">*</span>
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
                      <span className="text-red-500">*</span>
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
            className="w-full flex items-center justify-between pb-2 border-b cursor-pointer"
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
            <ClientsContactsForm
              form={form}
              contacts={contacts}
              removeContact={removeContact}
              addContact={addContact}
            />
          )}
        </section>

        {/* Direcciones */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setAddressesExpanded && setAddressesExpanded(!addressesExpanded)}
            className="w-full flex items-center justify-between pb-2 border-b cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
              <h3>Direcciones</h3>
              {addresses.length > 0 && (
                <Badge variant="outline" className="rounded-full">
                  {addresses.length}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${addressesExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {addressesExpanded && (
            <ClientsAddressesForm
              form={form}
              addresses={addresses}
              removeAddress={removeAddress}
              addAddress={addAddress}
            />
          )}
        </section>

        {/* Información SUNAT */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setSunatExpanded(!sunatExpanded)}
            className="w-full flex items-center justify-between pb-2 border-b cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
              <h3>Información SUNAT</h3>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${sunatExpanded ? "rotate-180" : ""}`} />
          </button>

          {sunatExpanded && <ClientsSunatInformationForm form={form} />}
        </section>
      </form>
    </Form>
  );
}
