"use client";

import { useState, type HTMLAttributes } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { useSignIn } from "../_hooks/useAuth";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const { mutate: login, isPending: isLoading } = useSignIn();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsRedirecting(true);

    login(data, {
      onError: () => {
        setIsRedirecting(false);
      },
    });
  }

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <LoadingTransition show={isRedirecting} message="Iniciando sesión, por favor espere..." />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Email field with enhanced styling */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        placeholder="tu@empresa.com"
                        autoComplete="email"
                        disabled={isLoading || isRedirecting}
                        className={cn(
                          "pl-4 pr-4 py-3 text-base transition-all duration-200",
                          "border-2",
                          "focus:border-primary focus:ring-4 focus:ring-primary/10",
                          "group-hover:border-primary/50",
                          focusedField === "email" && "border-primary shadow-lg shadow-primary/10"
                        )}
                        onFocus={() => setFocusedField("email")}
                        {...field}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Password field with enhanced styling */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading || isRedirecting}
                        className={cn(
                          focusedField === "password" && "border-primary border-2 shadow-lg shadow-primary/10"
                        )}
                        onFocus={() => setFocusedField("password")}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Enhanced submit button */}
          <Button
            type="submit"
            disabled={isLoading || isRedirecting}
            className={cn(
              "w-full py-3 text-base font-medium rounded-xl transition-all duration-200",
              "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
              "shadow-lg hover:shadow-xl hover:shadow-primary/25",
              "transform hover:scale-[1.02] active:scale-[0.98]",
              "disabled:transform-none disabled:shadow-none"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {isRedirecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirigiendo...
                </>
              ) : isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </Button>
        </form>
      </Form>
    </div>
  );
}
