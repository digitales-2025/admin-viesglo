"use client";

import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface DatosFiliacionSectionProps {
  isEditing: boolean;
}

type FormValues = {
  datosFiliacion: {
    dni: string;
    nombres: string;
    segundoNombre?: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    genero?: string;
    fechaNacimiento?: Date;
    emodate?: Date;
    edad?: number;
  };
};

export function DatosFiliacionSection({ isEditing }: DatosFiliacionSectionProps) {
  // Usar react-hook-form context
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<FormValues>();

  // Watch for changes to birthday to calculate age
  const fechaNacimiento = useWatch({
    control,
    name: "datosFiliacion.fechaNacimiento",
  });

  // Calculate age whenever birthday changes
  useEffect(() => {
    if (fechaNacimiento) {
      const birthDate = new Date(fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setValue("datosFiliacion.edad", age);
    }
  }, [fechaNacimiento, setValue]);

  // Extraer y tipificar los errores específicos
  const dniError = errors.datosFiliacion?.dni;
  const nombresError = errors.datosFiliacion?.nombres;
  const apellidoPaternoError = errors.datosFiliacion?.apellidoPaterno;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de filiación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="dni" className={dniError ? "text-destructive" : ""}>
              DNI <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.dni"
                control={control}
                render={({ field }) => <Input id="dni" {...field} className={dniError ? "border-destructive" : ""} />}
              />
            ) : (
              <Controller
                name="datosFiliacion.dni"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
                )}
              />
            )}
            {dniError && <p className="text-sm text-destructive">{String(dniError.message)}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="nombres" className={nombresError ? "text-destructive" : ""}>
              Nombres <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.nombres"
                control={control}
                render={({ field }) => (
                  <Input id="nombres" {...field} className={nombresError ? "border-destructive" : ""} />
                )}
              />
            ) : (
              <Controller
                name="datosFiliacion.nombres"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
                )}
              />
            )}
            {nombresError && <p className="text-sm text-destructive">{String(nombresError.message)}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="segundoNombre">Segundo nombre</Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.segundoNombre"
                control={control}
                render={({ field }) => <Input id="segundoNombre" {...field} />}
              />
            ) : (
              <Controller
                name="datosFiliacion.segundoNombre"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
                )}
              />
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="apellidoPaterno" className={apellidoPaternoError ? "text-destructive" : ""}>
              Apellido paterno <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.apellidoPaterno"
                control={control}
                render={({ field }) => (
                  <Input id="apellidoPaterno" {...field} className={apellidoPaternoError ? "border-destructive" : ""} />
                )}
              />
            ) : (
              <Controller
                name="datosFiliacion.apellidoPaterno"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
                )}
              />
            )}
            {apellidoPaternoError && <p className="text-sm text-destructive">{String(apellidoPaternoError.message)}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="apellidoMaterno">Apellido materno</Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.apellidoMaterno"
                control={control}
                render={({ field }) => <Input id="apellidoMaterno" {...field} />}
              />
            ) : (
              <Controller
                name="datosFiliacion.apellidoMaterno"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
                )}
              />
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="genero">Género</Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.genero"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    defaultValue={field.value || undefined}
                  >
                    <SelectTrigger id="genero">
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Controller
                name="datosFiliacion.genero"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
                )}
              />
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.fechaNacimiento"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Seleccionar fecha"
                    clearable
                  />
                )}
              />
            ) : (
              <Controller
                name="datosFiliacion.fechaNacimiento"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">
                    {field.value ? new Date(field.value).toLocaleDateString() : "No registrado"}
                  </div>
                )}
              />
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="edad">Edad</Label>
            <Controller
              name="datosFiliacion.edad"
              control={control}
              render={({ field }) => (
                <div className="py-2 px-3 border rounded-md bg-muted/20">
                  {field.value !== undefined ? `${field.value} años` : "No registrado"}
                </div>
              )}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="emodate">Fecha Emodate</Label>
            {isEditing ? (
              <Controller
                name="datosFiliacion.emodate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Seleccionar fecha"
                    clearable
                  />
                )}
              />
            ) : (
              <Controller
                name="datosFiliacion.emodate"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">
                    {field.value ? new Date(field.value).toLocaleDateString() : "No registrado"}
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
