import { useState } from "react";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ChangePasswordFormData, CreateUserFormData, UpdateUserFormData } from "../../_schemas/users.schemas";
import { PasswordOptions } from "../../_utils/user.utils";
import { useRoles } from "../../../roles/_hooks/useRoles";
import { Roles } from "../../../settings/_types/roles.types";
import UserCreateForm from "./create/UserCreateForm";
import UserUpdateForm from "./update/UserUpdateForm";

interface UsersEditorFormProps {
  isUpdate: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  createForm: UseFormReturn<CreateUserFormData>;
  updateForm: UseFormReturn<UpdateUserFormData>;
  passwordForm: UseFormReturn<ChangePasswordFormData>;
  isUserPending: boolean;
  isPasswordPending: boolean;
  passwordOptions: PasswordOptions;
  setPasswordOptions: React.Dispatch<React.SetStateAction<PasswordOptions>>;
  copiedPassword: boolean;
  setCopiedPassword: (value: boolean) => void;
  showPermissions: boolean;
  setShowPermissions: (visible: boolean) => void;
  isActualUser: boolean;
}

export default function UsersEditorForm({
  isUpdate,
  activeTab,
  setActiveTab,
  createForm,
  updateForm,
  passwordForm,
  isUserPending,
  isPasswordPending,
  passwordOptions,
  setPasswordOptions,
  copiedPassword,
  setCopiedPassword,
  showPermissions,
  isActualUser,
  setShowPermissions,
}: UsersEditorFormProps) {
  const { data, isLoading } = useRoles();
  const [showPassword, setShowPassword] = useState(false);

  const currentPassword = !isUpdate ? createForm.getValues("password") : "";
  const newPassword = isUpdate ? passwordForm.getValues("newPassword") : "";

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando roles y permisos...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 px-6">
          {isUpdate ? (
            <UserUpdateForm
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userForm={updateForm}
              passwordForm={passwordForm}
              isUserPending={isUserPending}
              isPasswordPending={isPasswordPending}
              passwordOptions={passwordOptions}
              setPasswordOptions={setPasswordOptions}
              copiedPassword={copiedPassword}
              setCopiedPassword={setCopiedPassword}
              showPermissions={showPermissions}
              setShowPermissions={setShowPermissions}
              newPassword={newPassword}
              setShowPassword={setShowPassword}
              showPassword={showPassword}
              isUpdate={isUpdate}
              data={data as unknown as Roles[]}
              isActualUser={isActualUser}
            />
          ) : (
            <UserCreateForm
              userForm={createForm}
              isUpdate={isUpdate}
              copiedPassword={copiedPassword}
              setCopiedPassword={setCopiedPassword}
              currentPassword={currentPassword ?? ""}
              passwordOptions={passwordOptions}
              setPasswordOptions={setPasswordOptions}
              data={data as unknown as Roles[]}
              setShowPassword={setShowPassword}
              showPassword={showPassword}
              isUserPending={isUserPending}
              setShowPermissions={setShowPermissions}
              showPermissions={showPermissions}
            />
          )}
        </div>
      )}
    </div>
  );
}
