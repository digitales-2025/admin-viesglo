import { useState } from "react";
import { Bot, Check, Copy, Eye, EyeOff, KeyRound, Lock, Shield, User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { ChangePasswordFormData, UpdateUserFormData } from "../../../_schemas/users.schemas";
import {
  copyPassword,
  generateAdvancedPassword,
  getRoleStatusBadge,
  PasswordOptions,
} from "../../../_utils/user.utils";
import { Roles } from "../../../../settings/_types/roles.types";
import PasswordOptionsCollapsible from "../PasswordOptionsCollapsible";
import RolePermissionsCollapsible from "../RolePermissionsCollapsible";

interface UserUpdateFormProps {
  userForm: UseFormReturn<UpdateUserFormData>;
  isUserPending: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  data: Array<Roles>;
  passwordOptions: PasswordOptions;
  showPermissions: boolean;
  setShowPermissions: (visible: boolean) => void;
  passwordForm: UseFormReturn<ChangePasswordFormData>;
  showPassword: boolean;
  setShowPassword: (visible: boolean) => void;
  isPasswordPending: boolean;
  isUpdate: boolean;
  newPassword: string;
  copiedPassword: boolean;
  setCopiedPassword: (value: boolean) => void;
  setPasswordOptions: React.Dispatch<React.SetStateAction<PasswordOptions>>;
  isActualUser: boolean;
}

export default function UserUpdateForm({
  userForm,
  isUserPending,
  activeTab,
  setActiveTab,
  data,
  passwordOptions,
  showPermissions,
  setShowPermissions,
  passwordForm,
  showPassword,
  setShowPassword,
  isPasswordPending,
  isUpdate,
  newPassword,
  copiedPassword,
  setCopiedPassword,
  setPasswordOptions,
  isActualUser,
}: UserUpdateFormProps) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const selectedRoleId = userForm.watch("roleId");
  const selectedRole = data?.find((role) => role.id === selectedRoleId);
  return (
    <Tabs value={isActualUser ? "user-data" : activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid w-full ${isActualUser ? "grid-cols-1" : "grid-cols-2"}`}>
        <TabsTrigger value="user-data" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Datos del Usuario
        </TabsTrigger>
        {/* Solo mostrar el trigger de cambiar contraseña si NO hay isActualUser */}
        {!isActualUser && (
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Cambiar Contraseña
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="user-data" className="space-y-6 mt-6">
        <Form {...userForm}>
          <div className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información Personal
                </CardTitle>
                <CardDescription>Actualiza los datos básicos del usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={userForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nombre
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingrese el nombre"
                            disabled={isUserPending}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={userForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Apellido
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingrese el apellido"
                            disabled={isUserPending}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rol y Permisos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rol y Permisos
                </CardTitle>
                <CardDescription>Actualiza el rol y revisa los permisos correspondientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Rol del usuario
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setShowPermissions(true);
                          }}
                        >
                          <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/20">
                            <SelectValue
                              placeholder="Selecciona un rol para el usuario"
                              {...(field.value
                                ? {
                                    children: (
                                      <div className="flex items-center gap-3 flex-1">
                                        <span className="font-medium">
                                          {data.find((role) => role.id === field.value)?.name}
                                        </span>
                                        {getRoleStatusBadge(data.find((role) => role.id === field.value)!)}
                                      </div>
                                    ),
                                  }
                                : {})}
                            />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {data?.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id}
                                className={cn("flex items-center justify-between p-3", !role.isActive && "opacity-50")}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{role.name}</span>
                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {role.description}
                                    </span>
                                  </div>
                                  {getRoleStatusBadge(role)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permisos del Rol Seleccionado */}
                {selectedRole && (
                  <RolePermissionsCollapsible
                    showPermissions={showPermissions}
                    setShowPermissions={setShowPermissions}
                    selectedRole={selectedRole}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </Form>
      </TabsContent>

      {!isActualUser && (
        <TabsContent value="password" className="space-y-6 mt-6">
          {passwordForm && (
            <Form {...passwordForm}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Cambiar Contraseña
                  </CardTitle>
                  <CardDescription>
                    Establece una nueva contraseña para el usuario. Se enviará automáticamente por correo electrónico.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Nueva contraseña
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Introduce la nueva contraseña"
                                  {...field}
                                  disabled={isPasswordPending}
                                  className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isPasswordPending}
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      type="button"
                                      disabled={isPasswordPending}
                                      onClick={() =>
                                        generateAdvancedPassword(
                                          true,
                                          passwordOptions,
                                          userForm,
                                          isUpdate,
                                          passwordForm
                                        )
                                      }
                                      className="shrink-0 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 bg-transparent"
                                    >
                                      <Bot className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Generar contraseña segura</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {newPassword && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        type="button"
                                        disabled={isPasswordPending}
                                        onClick={() => copyPassword(newPassword, setCopiedPassword)}
                                        className={cn(
                                          "shrink-0 transition-all duration-200",
                                          copiedPassword
                                            ? "bg-green-50 border-green-300 text-green-600"
                                            : "hover:bg-gray-50"
                                        )}
                                      >
                                        {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {copiedPassword ? "¡Copiado!" : "Copiar contraseña"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>

                            {/* Opciones de generación de contraseña */}
                            <PasswordOptionsCollapsible
                              passwordOptions={passwordOptions}
                              setPasswordOptions={setPasswordOptions}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Confirmar contraseña
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirma la nueva contraseña"
                              {...field}
                              disabled={isPasswordPending}
                              className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isPasswordPending}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AlertMessage
                    title="Notificación automática"
                    description="La nueva contraseña se enviará automáticamente al correo electrónico del usuario una vez confirmado el cambio."
                    variant="info"
                  />
                </CardContent>
              </Card>
            </Form>
          )}
        </TabsContent>
      )}
    </Tabs>
  );
}
