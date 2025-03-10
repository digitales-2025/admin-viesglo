"use client";

import { HTMLAttributes, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { cn } from "@/shared/lib/utils";
import { login } from "../_actions/auth";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

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
    // Limpiar cualquier timeout anterior
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    setIsLoading(true);

    // Establecer timeout para evitar carga infinita
    const timeout = setTimeout(() => {
      setIsLoading(false);
      toast.error("La solicitud está tardando demasiado. Por favor, inténtalo de nuevo.");
    }, 15000); // 15 segundos máximo

    setLoadingTimeout(timeout);

    try {
      // Enviar solicitud de login
      const result = await login(data);

      // Verificar resultado
      if (result && !result.success) {
        // Mostrar error si login falló
        toast.error(result.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      // Si llegamos aquí y no recibimos respuesta con error, asumimos éxito
      setIsRedirecting(true);
      toast.success("Inicio de sesión exitoso! Redirigiendo...");

      // Simulamos una redirección manual tras 1.5 segundos (tiempo para mostrar toast)
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: any) {
      console.error("Error durante el inicio de sesión:", error);
      toast.error(error.message || "Ha ocurrido un error durante el inicio de sesión");
    } finally {
      // Limpiar timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }

      // No reseteamos isLoading si estamos redirigiendo
      if (!isRedirecting) {
        setIsLoading(false);
      }
    }
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
