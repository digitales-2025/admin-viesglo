"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  ChangePasswordFormData,
  changePasswordSchema,
  CreateUserFormData,
  createUserSchema,
  UpdateUserFormData,
  updateUserSchema,
  UseUserFormReturn,
} from "../_schemas/users.schemas";
import { UserResponse } from "../_types/user.types";
import { useChangeUserPassword, useCreateUser, useUpdateUser } from "./use-users";

interface UseUserFormProps {
  isUpdate?: boolean;
  initialData?: UserResponse;
  onSuccess?: () => void;
  mode?: "user" | "password";
}

export function useUserForm(props: UseUserFormProps): UseUserFormReturn {
  const { isUpdate = false, initialData, onSuccess, mode = "user" } = props;

  // Hooks siempre al inicio
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      roleId: "",
    },
    mode: "onChange",
  });
  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      lastName: "",
      roleId: "",
    },
    mode: "onChange",
  });

  const { mutate: changePassword, isPending: isChangingPassword } = useChangeUserPassword();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  // Efectos para resetear formularios
  useEffect(() => {
    if (mode === "password") {
      passwordForm.reset({
        newPassword: "",
        confirmPassword: "",
      });
    } else if (!isUpdate) {
      if (isUpdate && initialData) {
        createForm.reset({
          name: initialData.name || "",
          lastName: initialData.lastName || "",
          email: initialData.email || "",
          roleId: initialData.role?.id || "",
          password: "",
        });
      } else {
        createForm.reset({
          name: "",
          lastName: "",
          email: "",
          password: "",
          roleId: "",
        });
      }
    } else {
      if (initialData) {
        updateForm.reset({
          name: initialData.name || "",
          lastName: initialData.lastName || "",
          roleId: initialData.role?.id || "",
        });
      }
    }
  }, [mode, isUpdate, initialData, passwordForm, createForm, updateForm]);

  // Lógica condicional para retornar el formulario correcto
  if (mode === "password") {
    const onSubmit = (data: ChangePasswordFormData) => {
      if (initialData?.id) {
        changePassword(
          {
            params: { path: { id: initialData.id } },
            body: {
              newPassword: data.newPassword,
              confirmPassword: data.confirmPassword,
            },
          },
          {
            onSuccess: () => {
              onSuccess?.();
              passwordForm.reset();
            },
          }
        );
      }
    };
    return {
      form: passwordForm,
      isUpdate: true,
      isPending: isChangingPassword,
      onSubmit,
      onSuccess,
    };
  }

  if (!isUpdate) {
    const onSubmit = (data: CreateUserFormData) => {
      createUser(
        { body: data },
        {
          onSuccess: () => {
            onSuccess?.();
            createForm.reset();
          },
        }
      );
    };
    return {
      form: createForm,
      isUpdate: false,
      isPending: isCreating,
      onSubmit,
      onSuccess,
    };
  }

  const onSubmit = (data: UpdateUserFormData) => {
    if (initialData?.id) {
      updateUser(
        {
          params: { path: { id: initialData.id } },
          body: data,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            updateForm.reset();
          },
        }
      );
    }
  };

  return {
    form: updateForm,
    isUpdate: true,
    isPending: isUpdating,
    onSubmit,
    onSuccess,
  };
}
