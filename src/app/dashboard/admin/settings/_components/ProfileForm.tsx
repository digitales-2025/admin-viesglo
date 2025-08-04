"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Building, CheckCircle, Edit3, Lock, Mail, Save, Settings, Shield, User } from "lucide-react";

import type { components } from "@/lib/api/types/api";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useProfileForm } from "../_hooks/use-profile-form";
import { getTimeAgo } from "../_utils/profile.utils";

interface ProfileFormProps {
  data: components["schemas"]["UserResponseDto"] & {
    isSuperAdmin?: boolean;
  };
}

export default function ProfileForm({ data }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const userData = {
    name: data.name,
    lastName: data.lastName ?? "",
    email: data.email,
    role: data.role?.name ?? "Usuario",
  };

  // Hook para el formulario de perfil
  const { form, isPending, onSubmit } = useProfileForm({
    initialData: {
      name: userData.name,
      lastName: userData.lastName,
    },
    onSuccess: () => setIsEditing(false),
  });

  useEffect(() => {
    form.reset({
      name: userData.name,
      lastName: userData.lastName,
    });
  }, [userData.name, userData.lastName]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="w-full space-y-10">
      {/* Header de perfil */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-4 border-b border-muted mt-6 lg:mt-0">
        <Avatar className="h-20 w-20 shadow-md ring-2 ring-primary/30">
          <AvatarFallback className="text-2xl font-bold">{getInitials(userData.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center md:items-start flex-1">
          <h2 className="text-2xl font-bold">
            {userData.name} {userData.lastName}
          </h2>
          <p className="text-muted-foreground">{userData.role}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verificado
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Activo
            </Badge>
          </div>
        </div>
        <div className="md:ml-auto w-full md:w-auto">
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="w-full md:w-auto"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>
      </div>

      {/* Información y formulario */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Información del sistema */}
        <div className="space-y-6">
          <h3 className="mb-2 text-lg font-semibold">Información del Sistema</h3>
          <div>
            <Label className="mb-2 flex items-center text-sm font-medium">
              <Mail className="mr-2 h-4 w-4" />
              Correo Electrónico
            </Label>
            <div className="relative">
              <Input value={userData.email ?? ""} disabled className="pr-10 bg-muted/40" />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Campo protegido por el sistema
            </p>
          </div>
          <div>
            <Label className="mb-2 flex items-center text-sm font-medium">
              <Building className="mr-2 h-4 w-4" />
              Rol en la Empresa
            </Label>
            <div className="relative">
              <Input value={userData.role} disabled className="pr-10 bg-muted/40" />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Asignado por administrador
            </p>
          </div>
        </div>

        {/* Información personal editable */}
        <div className="space-y-6">
          <h3 className="mb-2 text-lg font-semibold">Información Personal</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Nombres <span className="ml-1 text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className={isEditing ? "border-primary/50" : ""}
                        placeholder="Ingresa tu nombre"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Apellidos <span className="ml-1 text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className={isEditing ? "border-primary/50" : ""}
                        placeholder="Ingresa tu apellido"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full min-w-[160px] flex items-center justify-center"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>

      {/* Panel de estado */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-muted pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Estado de la Cuenta</p>
            <p className="text-xs text-muted-foreground">Última actualización: {getTimeAgo(data.updatedAt ?? "")}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Última sesión</p>
          <p className="text-sm font-medium">Ahora</p>
        </div>
      </div>
    </div>
  );
}
