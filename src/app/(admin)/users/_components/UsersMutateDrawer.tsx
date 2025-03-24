"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useCreateUser, useUpdateUser } from "../_hooks/useUsers";
import { User, UserCreate } from "../_types/user.types";
import { generateRandomPass } from "../_utils/generateRandomPass";
import { useRoles } from "../../roles/_hooks/useRoles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: User;
}
const baseSchema = {
  fullName: z.string().min(1, "El nombre es requerido."),
  email: z.string().min(1, "El email es requerido.").email("Email inválido."),
  phone: z
    .string()
    .optional()
    .refine((value) => value === "" || isValidPhoneNumber(value || ""), "Teléfono inválido."),
  post: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "El rol es requerido."),
};

const createSchema = z.object({
  ...baseSchema,
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      "La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número."
    ),
});

const updateSchema = z.object({
  ...baseSchema,
});

type UsersForm = z.infer<typeof createSchema> & {
  password?: string;
};

export function UserMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow?.id;
  const { mutate: createUserMutate, isPending: isCreating } = useCreateUser();
  const { mutate: updateUsereMutate, isPending: isUpdating } = useUpdateUser();
  const { data, isLoading } = useRoles();
  const isPending = isCreating || isUpdating;

  const form = useForm<UsersForm>({
    resolver: zodResolver(isUpdate ? updateSchema : createSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      post: "",
      roleIds: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        fullName: currentRow.fullName,
        email: currentRow.email,
        phone: currentRow.phone || "",
        post: currentRow.post || "",
        roleIds: currentRow.roles.map((role) => role.id),
      });
    }
  }, [isUpdate, currentRow?.id]);

  const onSubmit = (data: UsersForm) => {
    if (isUpdate) {
      const updateData = { ...data };
      if (updateData.password === "") {
        const { password: _, ...rest } = updateData;
        updateUsereMutate(
          { id: currentRow.id, data: rest },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          }
        );
      } else {
        updateUsereMutate(
          { id: currentRow.id, data: updateData },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          }
        );
      }
    } else {
      createUserMutate(data as UserCreate, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        fullName: currentRow.fullName,
        email: currentRow.email,
        phone: currentRow.phone || "",
        post: currentRow.post || "",
        roleIds: currentRow.roles.map((role) => role.id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
    >
      <SheetContent className="flex flex-col ">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">{isUpdate ? "Actualizar" : "Crear"} Usuario</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza el usuario proporcionando la información necesaria."
              : "Agrega un nuevo usuario proporcionando la información necesaria."}{" "}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-250px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Form {...form}>
              <form id="tasks-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese nombre completo" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese email" disabled={isPending} />
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
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="inline-flex gap-1">
                          <Input
                            type="text"
                            placeholder={
                              isUpdate
                                ? "Dejar en blanco para mantener la contraseña actual"
                                : "Introduce la contraseña de la clínica"
                            }
                            {...field}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  type="button"
                                  onClick={() => {
                                    field.onChange(generateRandomPass());
                                  }}
                                >
                                  <Bot />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Generar una contraseña</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <PhoneInput
                          defaultCountry="PE"
                          {...field}
                          placeholder="Ingrese su teléfono"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="post"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese el cargo" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleIds"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <Select value={field.value?.[0] || ""} onValueChange={(value) => field.onChange([value])}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {data?.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="tasks-form" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
