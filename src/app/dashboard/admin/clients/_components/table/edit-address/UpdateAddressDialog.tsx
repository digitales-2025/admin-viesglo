import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useAddAddressToClient, useUpdateAddressOfClient } from "../../../_hooks/use-clients";
import { ClientAddressFormData, clientAddressSchema } from "../../../_schemas/clients.schemas";
import { ClientAddressResponseDto } from "../../../_types/clients.types";

interface UpdateAddressDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingAddress?: ClientAddressResponseDto | null;
  setEditingAddress: (address: ClientAddressResponseDto | null) => void;
  clientId: string;
}

export default function UpdateAddressDialog({
  isDialogOpen,
  setIsDialogOpen,
  editingAddress,
  setEditingAddress,
  clientId,
}: UpdateAddressDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 650px)");

  const addAddress = useAddAddressToClient();
  const updateAddress = useUpdateAddressOfClient();

  const form = useForm<ClientAddressFormData>({
    resolver: zodResolver(clientAddressSchema),
    defaultValues: {
      address: "",
      reference: "",
    },
  });

  // Cargar datos en el form cuando editingAddress cambia
  useEffect(() => {
    if (editingAddress) {
      form.reset({
        address: editingAddress.address,
        reference: editingAddress.reference || "",
      });
    } else {
      form.reset({
        address: "",
        reference: "",
      });
    }
  }, [editingAddress, form]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    form.reset();
  };

  const onSubmit = (data: ClientAddressFormData) => {
    if (editingAddress) {
      // Actualizar dirección
      updateAddress.mutate(
        {
          params: {
            path: {
              id: clientId,
              addressId: editingAddress.id,
            },
          },
          body: {
            address: data.address,
            reference: data.reference,
          },
        },
        { onSuccess: handleCloseDialog }
      );
    } else {
      // Crear dirección
      addAddress.mutate(
        {
          params: {
            path: {
              id: clientId,
            },
          },
          body: {
            address: data.address,
            reference: data.reference,
          },
        },
        { onSuccess: handleCloseDialog }
      );
    }
  };

  return (
    <ResponsiveDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      isDesktop={isDesktop}
      title={editingAddress ? "Editar Dirección" : "Agregar Dirección"}
      description={editingAddress ? "Modifica los datos de la dirección" : "Completa los datos de la nueva dirección"}
      showTrigger={false}
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerContentClassName="max-h-[50vh]"
      drawerScrollAreaClassName="h-full px-0 pb-4"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="Dirección completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Referencia, punto de referencia, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={addAddress.isPending || updateAddress.isPending}
              className="flex items-center justify-center"
            >
              {addAddress.isPending || updateAddress.isPending ? (
                <>
                  <span className="mr-2">Guardando...</span>
                  <Loader className="animate-spin h-4 w-4" />
                </>
              ) : (
                <span>{editingAddress ? "Actualizar" : "Agregar"}</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
