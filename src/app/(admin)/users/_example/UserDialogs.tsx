"use client";

// import { useDialogStore } from "@/shared/stores/useDialogStore";

// Importaríamos los componentes de diálogo para usuarios
// import { UserMutateDrawer } from "./UserMutateDrawer";
// import { UserDeleteConfirmation } from "./UserDeleteConfirmation";

export default function UserDialogs() {
  //const { isOpenForModule, data, close } = useDialogStore();

  // Constantes para módulo
  //const MODULE = "users";

  return (
    <>
      {/* Diálogo para crear/editar usuario */}
      {/* 
      <UserMutateDrawer
        key="user-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Diálogo para eliminar usuario */}
      {/* 
      <UserDeleteConfirmation
        key="user-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        user={data}
      />
      */}
    </>
  );
}
