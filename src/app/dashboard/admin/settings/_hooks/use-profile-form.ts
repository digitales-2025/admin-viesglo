"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useLogout } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { passwordSchema, type PasswordForm } from "../_schemas/profile.schemas";
import { useChangeUserPassword } from "./use-profile";

interface UseProfileFormProps {
  onSuccess?: () => void;
}

export function useProfileForm({ onSuccess }: UseProfileFormProps) {
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
