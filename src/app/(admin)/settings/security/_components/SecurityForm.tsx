"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUpdatePassword } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { UpdatePassword } from "@/app/(auth)/sign-in/_types/auth.types";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { PasswordInput } from "@/shared/components/ui/password-input";

const formSchema = z.object({
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
  newPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
  confirmPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
});

export default function SecurityForm() {
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: UpdatePassword) => {
    updatePassword(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña actual</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormDescription>La contraseña debe coincidir con la contraseña actual.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>

              <FormDescription>Tu nueva contraseña debe ser diferente a la contraseña actual.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormDescription>La contraseña debe coincidir con la contraseña nueva.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Actualizando...
            </>
          ) : (
            "Actualizar perfil"
          )}
        </Button>
      </form>
    </Form>
  );
}
