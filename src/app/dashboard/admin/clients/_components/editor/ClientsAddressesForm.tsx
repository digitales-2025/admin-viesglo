import { MapPin, Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { ClientAddressFormData, CreateClientFormData } from "../../_schemas/clients.schemas";

interface ClientsAddressesFormProps {
  form: UseFormReturn<CreateClientFormData>;
  addresses: Array<ClientAddressFormData>;
  removeAddress: (index: number) => void;
  addAddress: () => void;
}

export default function ClientsAddressesForm({
  form,
  addresses,
  removeAddress,
  addAddress,
}: ClientsAddressesFormProps) {
  return (
    <div className="space-y-4">
      {addresses.map((_, index) => (
        <div key={index} className="relative px-2">
          <div className="absolute -left-6 top-0 w-px h-full bg-border" />
          <div className="space-y-4 p-4 border border-dashed rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground/95 font-semibold text-sm">Dirección {index + 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAddress(index)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Eliminar dirección"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name={`addresses.${index}.address`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">
                      Dirección<span className="text-red-500">*</span>
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
                name={`addresses.${index}.reference`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-muted-foreground">Referencia</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Frente al parque" {...field} />
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
        onClick={addAddress}
        className="w-full border-dashed hover:bg-muted/50 bg-transparent"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar Dirección
      </Button>
    </div>
  );
}
