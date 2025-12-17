"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { usePermissions } from "../../_hooks/use-permissions";
import { useRoleForm } from "../../_hooks/use-role-form";
import { useRoleDetail } from "../../_hooks/use-roles";
import { Permission } from "../../_types/roles";
import { RoleListItem } from "../../../settings/_types/roles.types";
import RolesEditorForm from "./RolesEditorForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: RoleListItem;
}

export function RolesEditorSheet({ open, onOpenChange, currentRow }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>(["users"]);
  const roleId = currentRow?.id;
  const { data: roleDetail, isLoading } = useRoleDetail(roleId || "", !!roleId);

  console.log("roleDetail", JSON.stringify(roleDetail, null, 2));

  const { form, isUpdate, isPending, onSubmit } = useRoleForm({
    isUpdate: !!currentRow?.id,
    initialData: roleDetail,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        permissions: [],
      });
      setSelectedTemplate(null);
      setSearchTerm("");
    }
  }, [open, form]);

  return (
    <GenericSheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
      title={isUpdate ? "Actualizar rol" : "Crear rol"}
      description={
        isUpdate
          ? "Modifica la configuración del rol existente."
          : "Define un nuevo rol con sus permisos correspondientes."
      }
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="roles-form"
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
                <span className="mr-2">{isUpdate ? "Actualizar rol" : "Crear rol"}</span>
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
      maxWidth="xl"
      titleClassName="text-2xl font-bold capitalize"
    >
      {isLoadingPermissions && isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando roles y permisos...</p>
          </div>
        </div>
      ) : (
        <RolesEditorForm
          form={form}
          onSubmit={onSubmit}
          isUpdate={isUpdate}
          isPending={isPending}
          permissions={permissions as Permission}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
        />
      )}
    </GenericSheet>
  );
}
