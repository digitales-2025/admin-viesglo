"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DynamicListForm } from "../dynamic-list-form";

interface DiagnosticValue {
  diagnosticId: string;
  diagnosticName: string;
  id: string;
  medicalRecordId: string;
  value: string[];
}

interface DiagnosticosSectionProps {
  diagnosticsValues: DiagnosticValue[];
  isEditing: boolean;
}

type FormValues = {
  diagnosticos: Record<string, string[]>;
};

export function DiagnosticosSection({ isEditing, diagnosticsValues }: DiagnosticosSectionProps) {
  // Usar react-hook-form context
  const { control, setValue, getValues } = useFormContext<FormValues>();

  // Inicializar los valores de diagnóstico de forma dinámica desde los valores recibidos
  // Solo se debe ejecutar cuando se monta el componente, no en cada rerenderizado
  useEffect(() => {
    if (diagnosticsValues && diagnosticsValues.length > 0) {
      // Verificar si diagnosticos ya tiene valores - no sobreescribir si ya están cargados
      const currentValues = getValues()?.diagnosticos || {};
      const hasExistingValues = Object.keys(currentValues).some(
        (key) => Array.isArray(currentValues[key]) && currentValues[key].length > 0
      );

      if (!hasExistingValues) {
        // Inicializar dinámicamente desde los valores recibidos
        const initialValues = diagnosticsValues.reduce(
          (acc, diag) => {
            if (diag.diagnosticName) {
              // Asegurarse de que value es siempre un array y contiene valores válidos
              acc[diag.diagnosticName] = Array.isArray(diag.value)
                ? diag.value.filter((v) => v !== null && v !== undefined && v !== "")
                : [];
            }
            return acc;
          },
          {} as Record<string, string[]>
        );

        // Solo establecer si hay valores para inicializar
        if (Object.keys(initialValues).length > 0) {
          setValue("diagnosticos", initialValues, { shouldDirty: false });
        }
      }
    }
  }, [diagnosticsValues, setValue, getValues]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Diagnósticos o conclusiones médicas por evaluación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {/* Renderizar todos los diagnósticos disponibles */}
          {diagnosticsValues &&
            diagnosticsValues.map((diagnostic) => (
              <DynamicListForm
                key={diagnostic.id}
                label={diagnostic.diagnosticName}
                name={`diagnosticos.${diagnostic.diagnosticName}`}
                control={control}
                isEditing={isEditing}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
