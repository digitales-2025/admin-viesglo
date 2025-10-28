import { MapPin, Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { ContactFormData, CreateClientFormData } from "../../_schemas/clients.schemas";

interface ClientsContactsFormProps {
  form: UseFormReturn<CreateClientFormData>;
  contacts: Array<ContactFormData>;
  removeContact: (index: number) => void;
  addContact: () => void;
}

export default function ClientsContactsForm({ form, contacts, removeContact, addContact }: ClientsContactsFormProps) {
  return (
    <div className="space-y-4">
      {contacts.map((_, index) => (
        <div key={index} className="relative px-2">
          <div className="absolute -left-6 top-0 w-px h-full bg-border" />
          <div className="space-y-4 p-4 border border-dashed rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground/95 font-semibold text-sm">Contacto {index + 1}</span>
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Nombre <span className="text-red-500">*</span>
                    </FormLabel>
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Cargo
                      <span className="text-red-500">*</span>
                    </FormLabel>
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Teléfono<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput defaultCountry="PE" placeholder="987 654 321" {...field} />
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Email<span className="text-red-500">*</span>
                    </FormLabel>
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
  );
}
