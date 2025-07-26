"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useLogout } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { passwordSchema, UserInfoForm, userInfoSchema, type PasswordForm } from "../_schemas/profile.schemas";
import { useChangeUserPassword, useUpdateProfile } from "./use-profile";

interface useChangePasswordFormProps {
  onSuccess?: () => void;
}

export function useChangePasswordForm({ onSuccess }: useChangePasswordFormProps) {
  const { mutate: changePassword, isPending, isSuccess } = useChangeUserPassword();
  const { onLogout } = useLogout();

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current: "",
      new: "",
      confirm: "",
    },
    mode: "onChange",
  });

  // Resetear el formulario al éxito
  useEffect(() => {
    if (isSuccess) {
      form.reset();
      onSuccess?.();
      onLogout();
    }
  }, [isSuccess]);

  // Submit final
  const onSubmit = (data: PasswordForm) => {
    changePassword({
      body: {
        currentPassword: data.current,
        password: data.new,
        confirmPassword: data.confirm,
      },
    });
  };

  return {
    form,
    isPending,
    isSuccess,
    onSubmit,
  };
}

export function useProfileForm({ initialData, onSuccess }: { initialData?: UserInfoForm; onSuccess?: () => void }) {
  const { mutate: updateProfile, isPending, isSuccess } = useUpdateProfile();

  const form = useForm<UserInfoForm>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: initialData || {
      name: "",
      lastName: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isSuccess) {
      form.reset();
      onSuccess?.();
    }
  }, [isSuccess]);

  const onSubmit = (data: UserInfoForm) => {
    updateProfile({
      body: {
        name: data.name,
        lastName: data.lastName,
      },
    });
  };

  return {
    form,
    isPending,
    isSuccess,
    onSubmit,
  };
}
