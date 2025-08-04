"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, RefreshCw, User, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet-responsive";
import { useUserForm } from "../../_hooks/use-user-form";
import { ChangePasswordFormData, CreateUserFormData, UpdateUserFormData } from "../../_schemas/users.schemas";
import type { UserResponse } from "../../_types/user.types";
import { PasswordOptions } from "../../_utils/user.utils";
import UsersEditorForm from "./UsersEditorForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: UserResponse;
  actualUserId?: string;
}

export function UsersEditorSheet({ open, onOpenChange, currentRow, actualUserId }: Props) {
  const isUpdate = !!currentRow?.id;

  // Nueva constante para comparar IDs
  const isActualUser = !!currentRow?.id && !!actualUserId && currentRow.id === actualUserId;

  const [showPermissions, setShowPermissions] = useState(false);
  const [activeTab, setActiveTab] = useState("user-data");
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Formulario para datos del usuario
  const userFormResult = useUserForm({
    isUpdate,
    initialData: currentRow,
    onSuccess: () => {
      onOpenChange(false);
    },
    mode: "user",
  });

  // Formulario para cambio de contraseña (solo en modo actualizar)
  const passwordFormResult = useUserForm({
    isUpdate: true,
    initialData: currentRow,
    onSuccess: () => {
      onOpenChange(false);
    },
    mode: "password",
  });

  // Tipos concretos y funciones concretas
  const userForm = isUpdate
    ? (userFormResult.form as UseFormReturn<UpdateUserFormData>)
    : (userFormResult.form as UseFormReturn<CreateUserFormData>);
  const userOnSubmit = isUpdate
    ? (userFormResult.onSubmit as (data: UpdateUserFormData) => void)
    : (userFormResult.onSubmit as (data: CreateUserFormData) => void);

  const passwordForm = passwordFormResult.form as UseFormReturn<ChangePasswordFormData>;
  const passwordOnSubmit = passwordFormResult.onSubmit as (data: ChangePasswordFormData) => void;

  useEffect(() => {
    if (!open) {
      userForm.reset();
      passwordForm.reset();
      setShowPermissions(false);
      setCopiedPassword(false);
      setActiveTab("user-data");
    }
  }, [open, userForm, passwordForm]);

  const handleUserFormSubmit = () => {
    if (isUpdate) {
      (userForm as UseFormReturn<UpdateUserFormData>).handleSubmit(
        userOnSubmit as (data: UpdateUserFormData) => void
      )();
    } else {
      (userForm as UseFormReturn<CreateUserFormData>).handleSubmit(
        userOnSubmit as (data: CreateUserFormData) => void
      )();
    }
  };

  const handlePasswordFormSubmit = () => {
    (passwordForm as UseFormReturn<ChangePasswordFormData>).handleSubmit(
      passwordOnSubmit as (data: ChangePasswordFormData) => void
    )();
  };

  return (
    <GenericSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`${isUpdate ? "Actualizar" : "Crear"} Usuario`}
      description={
        isUpdate
          ? "Actualiza la información del usuario y gestiona sus credenciales de acceso."
          : "Crea un nuevo usuario y asigna los permisos correspondientes para el sistema."
      }
      maxWidth="lg"
      rounded="lg"
      titleClassName="text-2xl font-bold capitalize"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          {isUpdate ? (
            <>
              {activeTab === "user-data" ? (
                <Button onClick={handleUserFormSubmit} disabled={userFormResult.isPending} className="min-w-[120px]">
                  {userFormResult.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar Datos
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePasswordFormSubmit}
                  disabled={passwordFormResult.isPending}
                  className="min-w-[120px]"
                >
                  {passwordFormResult.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleUserFormSubmit} disabled={userFormResult.isPending} className="min-w-[120px]">
              {userFormResult.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          )}
          <SheetClose asChild>
            <Button
              variant="outline"
              disabled={userFormResult.isPending || passwordFormResult.isPending}
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      }
    >
      <UsersEditorForm
        isUpdate={isUpdate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        createForm={userForm as UseFormReturn<CreateUserFormData>}
        updateForm={userForm as UseFormReturn<UpdateUserFormData>}
        passwordForm={passwordForm}
        isUserPending={userFormResult.isPending}
        isPasswordPending={passwordFormResult.isPending}
        passwordOptions={passwordOptions}
        setPasswordOptions={setPasswordOptions}
        copiedPassword={copiedPassword}
        setCopiedPassword={setCopiedPassword}
        showPermissions={showPermissions}
        setShowPermissions={setShowPermissions}
        isActualUser={isActualUser}
      />
    </GenericSheet>
  );
}
