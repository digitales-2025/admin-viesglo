"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

interface AptitudSectionProps {
  isEditing: boolean;
}

type FormValues = {
  aptitud: {
    aptitud: string;
    restricciones?: string;
    personalHistory?: string;
  };
};

export function AptitudSection({ isEditing }: AptitudSectionProps) {
  // Usar react-hook-form context
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<FormValues>();

  // Observar el valor de aptitud para mostrar/ocultar restricciones
  const aptitudValue = watch("aptitud.aptitud");

  // Extraer y tipificar los errores específicos
  const aptitudError = errors.aptitud?.aptitud;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aptitud</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <Label htmlFor="aptitud" className={aptitudError ? "text-destructive" : ""}>
              Aptitud <span className="text-destructive">*</span>
            </Label>
            {isEditing ? (
              <Controller
                name="aptitud.aptitud"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={aptitudError ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccionar aptitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APT">Apto</SelectItem>
                      <SelectItem value="NOT_APT">No Apto</SelectItem>
                      <SelectItem value="APT_WITH_RESTRICTIONS">Apto con Restricciones</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Controller
                name="aptitud.aptitud"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20">
                    {field.value
                      ? field.value === "APT"
                        ? "Apto"
                        : field.value === "NOT_APT"
                          ? "No Apto"
                          : field.value === "APT_WITH_RESTRICTIONS"
                            ? "Apto con Restricciones"
                            : field.value
                      : "No registrado"}
                  </div>
                )}
              />
            )}
            {aptitudError && <p className="text-sm text-destructive">{String(aptitudError.message)}</p>}
          </div>

          {aptitudValue === "APT_WITH_RESTRICTIONS" && (
            <div className="space-y-3">
              <Label htmlFor="restricciones">Restricciones</Label>
              {isEditing ? (
                <Controller
                  name="aptitud.restricciones"
                  control={control}
                  render={({ field }) => <Textarea id="restricciones" {...field} rows={4} />}
                />
              ) : (
                <Controller
                  name="aptitud.restricciones"
                  control={control}
                  render={({ field }) => (
                    <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[100px] whitespace-pre-wrap">
                      {field.value || "No registrado"}
                    </div>
                  )}
                />
              )}
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="personalHistory">Antecedentes personales</Label>
            {isEditing ? (
              <Controller
                name="aptitud.personalHistory"
                control={control}
                render={({ field }) => <Textarea id="personalHistory" {...field} rows={4} />}
              />
            ) : (
              <Controller
                name="aptitud.personalHistory"
                control={control}
                render={({ field }) => (
                  <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[100px] whitespace-pre-wrap">
                    {field.value || "No registrado"}
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
