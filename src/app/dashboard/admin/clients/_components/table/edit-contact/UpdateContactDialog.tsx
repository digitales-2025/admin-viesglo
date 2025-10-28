import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useAddContactToClient, useUpdateContactOfClient } from "../../../_hooks/use-clients";
import { ContactFormData, contactSchema } from "../../../_schemas/clients.schemas";
import { ClientContactResponseDto } from "../../../_types/clients.types";

interface UpdateContactDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingContact?: ClientContactResponseDto | null;
  setEditingContact: (contact: ClientContactResponseDto | null) => void;
  clientId: string;
}

export default function UpdateContactDialog({
  isDialogOpen,
  setIsDialogOpen,
  editingContact,
  setEditingContact,
  clientId,
}: UpdateContactDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 650px)");

  const addContact = useAddContactToClient();
  const updateContact = useUpdateContactOfClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      position: "",
      phone: "",
      email: "",
    },
  });

  // Cargar datos en el form cuando editingContact cambia
  useEffect(() => {
    if (editingContact) {
      form.reset({
        name: editingContact.name,
        position: editingContact.position,
        phone: editingContact._phone.value,
        email: editingContact._email.value,
      });
    } else {
      form.reset({
        name: "",
        position: "",
        phone: "",
        email: "",
      });
    }
  }, [editingContact, form]);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
    form.reset();
  };

  const onSubmit = (data: ContactFormData) => {
    if (editingContact) {
      // Actualizar contacto
      updateContact.mutate(
        {
          params: {
            path: {
              id: clientId,
              email: editingContact._email.value,
            },
          },
          body: {
            name: data.name,
            position: data.position,
            phone: data.phone,
            email: data.email,
          },
        },
        { onSuccess: handleCloseDialog }
      );
    } else {
      // Crear contacto
      addContact.mutate(
        {
          params: {
            path: {
              id: clientId,
            },
          },
          body: {
            name: data.name,
            position: data.position,
            phone: data.phone,
            email: data.email,
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
      title={editingContact ? "Editar Contacto" : "Agregar Contacto"}
      description={editingContact ? "Modifica los datos del contacto" : "Completa los datos del nuevo contacto"}
      showTrigger={false}
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerContentClassName="max-h-[50vh]"
      drawerScrollAreaClassName="h-full px-0 pb-4"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Cargo o posición" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="978 423 560"
                    defaultCountry="PE"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@ejemplo.com" type="email" {...field} />
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
              disabled={addContact.isPending || updateContact.isPending}
              className="flex items-center justify-center"
            >
              {addContact.isPending || updateContact.isPending ? (
                <>
                  <span className="mr-2">Guardando...</span>
                  {/* Spinner usando Loader de lucide-react */}
                  <Loader className="animate-spin h-4 w-4" />
                </>
              ) : (
                <>
                  <span>{editingContact ? "Actualizar" : "Agregar"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
