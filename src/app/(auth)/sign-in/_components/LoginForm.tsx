"use client";

import { HTMLAttributes, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { useLogin } from "../_hooks/useAuth";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const { mutate: login, isPending: isLoading } = useLogin();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  // Para manejar timeout de carga
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    login(data, {
      onSuccess: () => {
        setIsRedirecting(true);
        success("Inicio de sesión exitoso! Redirigiendo...");

        // Guarda la referencia del timeout
        const timeoutId = setTimeout(() => {
          router.push("/");
        }, 1500);

        setLoadingTimeout(timeoutId);
      },
      onError: (err: Error) => {
        error(err.message || "Error al iniciar sesión");
      },
    });
  }
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {/* Componente de transición para indicar redirección */}
      <LoadingTransition show={isRedirecting} message="Iniciando sesión, por favor espere..." />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nombre@ejemplo.com"
                      autoComplete="email"
                      disabled={isLoading || isRedirecting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:opacity-75"
                    >
                      ¿Has olvidado tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="********"
                      autoComplete="current-password"
                      disabled={isLoading || isRedirecting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={isLoading || isRedirecting}>
              {isRedirecting ? "Redirigiendo..." : isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
