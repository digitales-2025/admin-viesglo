"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Building,
  CheckCircle,
  Edit3,
  Key,
  Lock,
  Mail,
  Save,
  Settings,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { components } from "@/lib/api/types/api";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";

// Schemas de validación
const userInfoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(250, "El nombre no puede exceder 250 caracteres"),
  lastName: z.string().min(1, "El apellido es requerido").max(250, "El apellido no puede exceder 250 caracteres"),
});

const passwordSchema = z
  .object({
    current: z.string().min(1, "La contraseña actual es requerida"),
    new: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/\d/, "Debe contener al menos un número")
      .regex(/[!@#$%^&*()_,.?":{}|<>]/, "Debe contener al menos un carácter especial"),
    confirm: z.string(),
  })
  .refine((data) => data.new === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

type UserInfoForm = z.infer<typeof userInfoSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface PasswordRequirement {
  id: string;
  text: string;
  regex: RegExp;
  met: boolean;
}

interface ProfileFormProps {
  data: components["schemas"]["UserResponseDto"] & {
    isSuperAdmin?: boolean;
  };
}

export default function AccountForm({ data }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Asume que data tiene la estructura adecuada
  const userData = {
    name: data.name,
    lastName: data.lastName ?? "",
    email: data.email,
    role: data.role?.name ?? "Usuario",
  };

  const getProgressColor = () => {
    const strength = getPasswordStrength();
    if (strength < 40) {
      return "bg-red-500 dark:bg-red-600";
    }
    if (strength < 80) {
      return "bg-yellow-500 dark:bg-yellow-600";
    }
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  // Formulario de información personal
  const userForm = useForm<UserInfoForm>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: userData.name,
      lastName: userData.lastName ?? "",
    },
  });

  // Formulario de contraseña
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current: "",
      new: "",
      confirm: "",
    },
  });

  // Watch para validación en tiempo real
  const newPassword = passwordForm.watch("new");
  const confirmPassword = passwordForm.watch("confirm");

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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getPasswordStrength = () => {
    const metRequirements = passwordRequirements.filter((req) => req.met).length;
    return (metRequirements / passwordRequirements.length) * 100;
  };

  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength < 40) {
      return "Débil";
    }
    if (strength < 80) {
      return "Media";
    }
    return "Fuerte";
  };

  const onUserInfoSubmit = (data: UserInfoForm) => {
    console.log("Datos del usuario:", data);
    setIsEditing(false);
    // Aquí iría la llamada a la API
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    console.log("Cambio de contraseña:", data);
    passwordForm.reset();
    // Aquí iría la llamada a la API
  };

  function getTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return "Hoy";
    }
    if (diffDays === 1) {
      return "Ayer";
    }
    return `Hace ${diffDays} días`;
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header Profesional */}
        <div className="rounded-lg  border border-gray-100 bg-card overflow-hidden">
          <div className="bg-card border-b border-gray-200 px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-gray-200 bg-white dark:bg-gray-900">
                  <AvatarFallback className="text-xl font-semibold text-gray-700 dark:text-white bg-gray-50 dark:bg-gray-900">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center lg:text-left flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {userData.name} {userData.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-3">{userData.role}</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                    <Shield className="w-3 h-3 mr-1" />
                    Acceso Total
                  </Badge>
                </div>
              </div>

              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="lg">
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? "Cancelar Edición" : "Editar Perfil"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <Card className=" border-gray-200 rounded-lg overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Información Personal</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Gestiona tu información de contacto
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Input
                        value={userData.email ?? ""}
                        disabled
                        className="bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 h-12"
                      />
                      <div className="absolute right-4 top-4">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Campo protegido por el sistema
                    </p>
                  </div>

                  {/* Rol */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Rol en la Empresa
                    </Label>
                    <div className="relative">
                      <Input
                        value={userData.role}
                        disabled
                        className="bg-gray-50 border-gray-200 text-gray-500 h-12 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
                      />
                      <div className="absolute right-4 top-4">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Asignado por administrador
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onUserInfoSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Nombre */}
                      <FormField
                        control={userForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Nombre Completo *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={`h-12 transition-all duration-200 ${
                                  isEditing
                                    ? "focus:ring-2"
                                    : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                                }`}
                                placeholder="Ingresa tu nombre completo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Apellido */}
                      <FormField
                        control={userForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Apellido *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                className={`h-12 transition-all duration-200 ${
                                  isEditing
                                    ? "focus:ring-2"
                                    : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                                }`}
                                placeholder="Ingresa tu apellido"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {isEditing && (
                      <div className="pt-6 border-t border-gray-100">
                        <Button type="submit" size="lg" value={"default"} className="w-full md:w-auto">
                          <Save className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Seguridad */}
          <div className="space-y-6">
            <Card className=" border-gray-200 rounded-lg overflow-hidden">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Seguridad</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Cambiar contraseña</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    {/* Contraseña Actual */}
                    <FormField
                      control={passwordForm.control}
                      name="current"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contraseña Actual
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              className="h-12 border-gray-300"
                              placeholder="Contraseña actual"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Nueva Contraseña */}
                    <FormField
                      control={passwordForm.control}
                      name="new"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nueva Contraseña
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              className="h-12 border-gray-300 focus:ring-2"
                              placeholder="Nueva contraseña"
                            />
                          </FormControl>
                          <FormMessage />

                          {/* Indicador de Fortaleza */}
                          {newPassword && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Fortaleza:</span>
                                <span
                                  className={`text-xs font-medium ${
                                    getPasswordStrength() < 40
                                      ? "text-red-600 dark:text-red-500"
                                      : getPasswordStrength() < 80
                                        ? "text-yellow-600 dark:text-yellow-500"
                                        : "text-emerald-600 dark:text-emerald-500"
                                  }`}
                                >
                                  {getStrengthText()}
                                </span>
                              </div>
                              <Progress value={getPasswordStrength()} className="h-2" color={getProgressColor()} />
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Confirmar Contraseña */}
                    <FormField
                      control={passwordForm.control}
                      name="confirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirmar Contraseña
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              className={`h-12 border-gray-300 focus:ring-2 ${
                                confirmPassword && passwordsMatch
                                  ? "border-green-400 focus:border-green-400 focus:ring-green-100"
                                  : confirmPassword && !passwordsMatch
                                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                    : "focus:border-blue-400 focus:ring-blue-100"
                              }`}
                              placeholder="Confirmar contraseña"
                            />
                          </FormControl>
                          <FormMessage />

                          {/* Validación de Coincidencia */}
                          {confirmPassword && (
                            <div
                              className={`flex items-center gap-2 text-xs ${
                                passwordsMatch ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {passwordsMatch ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    {/* Requisitos de Contraseña */}
                    {newPassword && (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Requisitos de Contraseña
                        </h4>
                        <div className="space-y-3">
                          {passwordRequirements.map((req) => (
                            <div
                              key={req.id}
                              className={`flex items-start gap-3 text-sm transition-all duration-200 ${
                                req.met ? "text-green-700" : "text-slate-600"
                              }`}
                            >
                              <div className="mt-0.5">
                                {req.met ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                                )}
                              </div>
                              <span className={`leading-relaxed ${req.met ? "line-through opacity-75" : ""}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <strong>Caracteres especiales permitidos:</strong> ! @ # $ % ^ & * ( ) _ , . ? &quot; :{" "}
                            {"{}"} | {"<"} {">"}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="default"
                      size={"lg"}
                      className="w-full"
                      disabled={!passwordForm.formState.isValid || getPasswordStrength() < 100}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Actualizar Contraseña
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Panel de Estado */}
            <Card className=" border-gray-200 rounded-lg overflow-hidden">
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Estado de la Cuenta</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Última actualización: {getTimeAgo(data.updatedAt ?? "")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-300">Última sesión</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Ahora</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
