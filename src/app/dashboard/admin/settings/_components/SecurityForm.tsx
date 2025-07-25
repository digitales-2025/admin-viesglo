"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Key, Shield, XCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { Progress } from "@/shared/components/ui/progress";
import { useProfileForm } from "../_hooks/use-profile-form";
import type { PasswordRequirement } from "../_types/password";
import { getPasswordStrength, getProgressColor, getStrengthText } from "../_utils/profile.utils";

export default function SecurityForm() {
  // Hook para el formulario de cambio de contraseña
  const { form, isPending, onSubmit } = useProfileForm({});

  // Requisitos visuales de contraseña
  const [passwordRequirements, setPasswordRequirements] = useState<Array<PasswordRequirement>>([
    { id: "length", text: "Mínimo 8 caracteres", regex: /.{8,}/, met: false },
    { id: "uppercase", text: "Al menos una letra mayúscula (A-Z)", regex: /[A-Z]/, met: false },
    { id: "lowercase", text: "Al menos una letra minúscula (a-z)", regex: /[a-z]/, met: false },
    { id: "number", text: "Al menos un número (0-9)", regex: /\d/, met: false },
    {
      id: "special",
      text: 'Al menos un carácter especial (!@#$%^&*()_,.?":{}|<>)',
      regex: /[!@#$%^&*()_,.?":{}|<>]/,
      met: false,
    },
  ]);

  const newPassword = form.watch("new");
  const confirmPassword = form.watch("confirm");
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    const updatedRequirements = passwordRequirements.map((req) => ({
      ...req,
      met: req.regex.test(newPassword || ""),
    }));
    setPasswordRequirements(updatedRequirements);
  }, [newPassword]);

  useEffect(() => {
    setPasswordsMatch(newPassword !== "" && newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  return (
    <div className="w-full space-y-8">
      {/* Header simple */}
      <div className="flex items-center space-x-3 w-full max-w-3xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary shr" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Seguridad de la Cuenta</h2>
          <p className="text-muted-foreground">Actualiza tu contraseña para mantener tu cuenta segura</p>
        </div>
      </div>

      {/* Formulario compacto */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="current"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña Actual</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Contraseña actual" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="new"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Nueva contraseña" />
                </FormControl>
                <FormMessage />

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Fortaleza:</span>
                      <span
                        className={`text-xs font-medium ${
                          getPasswordStrength(passwordRequirements) < 40
                            ? "text-red-600"
                            : getPasswordStrength(passwordRequirements) < 80
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {getStrengthText(passwordRequirements)}
                      </span>
                    </div>
                    <Progress
                      value={getPasswordStrength(passwordRequirements)}
                      className="h-2"
                      color={getProgressColor(passwordRequirements)}
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    className={`${
                      confirmPassword && passwordsMatch
                        ? "border-green-400"
                        : confirmPassword && !passwordsMatch
                          ? "border-red-400"
                          : ""
                    }`}
                    placeholder="Confirmar contraseña"
                  />
                </FormControl>
                <FormMessage />

                {confirmPassword && (
                  <div
                    className={`mt-1 flex items-center gap-2 text-xs ${
                      passwordsMatch ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {passwordsMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                  </div>
                )}
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid || getPasswordStrength(passwordRequirements) < 100 || isPending}
          >
            <Shield className="mr-2 h-4 w-4" />
            Actualizar Contraseña
          </Button>
        </form>
      </Form>

      {/* Panel de requisitos */}
      {newPassword && (
        <Card className="w-full">
          <CardContent className="p-4 space-y-3">
            <h4 className="flex items-center text-sm font-semibold mb-2">
              <Key className="mr-2 h-4 w-4" />
              Requisitos de Contraseña
            </h4>
            <div className="space-y-2">
              {passwordRequirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-start gap-2 text-xs ${req.met ? "text-green-700" : "text-muted-foreground"}`}
                >
                  <div className="mt-0.5">
                    {req.met ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                    )}
                  </div>
                  <span className={req.met ? "line-through opacity-75" : ""}>{req.text}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">
                <strong>Caracteres especiales:</strong> ! @ # $ % ^ & * ( ) _ , . ? &quot; : {"{}"} | {"<"} {">"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
