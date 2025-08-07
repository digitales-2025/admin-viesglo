"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useClientForm } from "../../_hooks/use-client-form";
import type { ClientOperationResponseDto } from "../../_types/clients.types";
import ClientsEditorForm from "./ClientsEditorForm";

interface ClientsEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ClientOperationResponseDto;
}

export function ClientsEditorSheet({ open, onOpenChange, currentRow }: ClientsEditorSheetProps) {
  const [contactsExpanded, setContactsExpanded] = useState(true);
  const [sunatExpanded, setSunatExpanded] = useState(true);
  const [addressesExpanded, setAddressesExpanded] = useState(true);

  const isUpdate = !!currentRow;

  const { form, addContact, removeContact, onSubmit, isPending, addAddress, removeAddress } = useClientForm({
    isUpdate: isUpdate,
    initialData: currentRow,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  // Limpiar formulario cuando se cambia entre crear/actualizar
  useEffect(() => {
    if (open) {
      if (!isUpdate) {
        // Si es crear, resetear completamente el formulario
        form.reset({
          ruc: "",
          name: "",
          email: "",
          legalRepresentative: "",
          contacts: [],
          addresses: [],
          sunatInfo: {
            address: "",
            fullAddress: "",
            businessName: "",
            state: undefined,
            condition: undefined,
            department: "",
            province: "",
            district: "",
          },
        });
      }
    }
  }, [open, isUpdate, form]);

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
          <Button
            form="client-form"
            type="submit"
            disabled={isPending}
            className="min-w-[180px] flex items-center justify-center"
          >
            {isPending ? (
              <>
                <span className="mr-2">Guardando...</span>
                <Send className="w-4 h-4 opacity-0" />
              </>
            ) : (
              <>
                <span className="mr-2">{isUpdate ? "Actualizar cliente" : "Crear cliente"}</span>
                <Send className="w-4 h-4" />
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
      <ClientsEditorForm
        form={form}
        isUpdate={isUpdate}
        contactsExpanded={contactsExpanded}
        setContactsExpanded={setContactsExpanded}
        sunatExpanded={sunatExpanded}
        setSunatExpanded={setSunatExpanded}
        addContact={addContact}
        removeContact={removeContact}
        onSubmit={onSubmit}
        addressesExpanded={addressesExpanded}
        setAddressesExpanded={setAddressesExpanded}
        addAddress={addAddress}
        removeAddress={removeAddress}
      />
    </GenericSheet>
  );
}
