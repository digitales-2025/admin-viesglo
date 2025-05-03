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

  // Log para diagnosticsValues al cargar el componente
  useEffect(() => {
    console.log("💊 DIAGNOSTICOSSECTION - Componente inicializado con: ", {
      isEditing,
      diagnosticsValues: diagnosticsValues?.map((d) => ({
        id: d.id,
        diagnosticId: d.diagnosticId,
        diagnosticName: d.diagnosticName,
        value: d.value,
      })),
    });

    // Verificar estructura de diagnosticsValues
    if (diagnosticsValues && diagnosticsValues.length > 0) {
      console.log("💊 VERIFICACIÓN DE DIAGNÓSTICOS:");
      diagnosticsValues.forEach((diag) => {
        console.log(`   - ID: ${diag.diagnosticId}`);
        console.log(`     Nombre: ${diag.diagnosticName}`);
        console.log(`     Valores: [${diag.value?.join(", ") || ""}]`);
      });
    }
  }, [isEditing, diagnosticsValues]);

  // Inicializar los valores de diagnóstico desde los valores recibidos
  useEffect(() => {
    if (diagnosticsValues && diagnosticsValues.length > 0) {
      console.log("💊 Cargando valores de diagnóstico directamente al formulario");

      // Limpiamos primero cualquier valor existente para evitar duplicidades
      const cleanValues = {
        diagnosticoOftalmologia: [],
        diagnosticoMusculoesqueletico: [],
        alteracionDiagnosticoPsicologia: [],
        diagnosticoAudiometria: [],
        diagnosticoEspirometria: [],
        diagnosticoEkg: [],
        resultadoTestSomnolencia: [],
        customFields: [],
      };

      setValue("diagnosticos", cleanValues as any, { shouldDirty: false });

      // Recorrer cada valor de diagnóstico
      diagnosticsValues.forEach((diag) => {
        if (diag.diagnosticName && Array.isArray(diag.value)) {
          // Usar directamente el nombre del diagnóstico para el campo
          const fieldName = `diagnosticos.${diag.diagnosticName}`;
          console.log(`💊 Estableciendo ${fieldName} con valores:`, diag.value);

          // Verificar si valores son strings
          if (diag.value.length > 0) {
            const allStrings = diag.value.every((v) => typeof v === "string");
            if (!allStrings) {
              console.warn(`⚠️ ADVERTENCIA: No todos los valores son strings en ${diag.diagnosticName}:`, diag.value);
            }
          }

          // Establecer los valores en el formulario directamente
          setValue(fieldName as any, diag.value, { shouldDirty: false });
        }
      });

      // Log del estado del formulario después de cargar valores
      setTimeout(() => {
        const formValues = getValues().diagnosticos;

        // Verificar que todos los campos necesarios estén presentes
        console.log("💊 VERIFICACIÓN FINAL DEL FORMULARIO:");
        diagnosticsValues.forEach((diag) => {
          const fieldValue = (formValues as any)[diag.diagnosticName];
          console.log(`   - Campo ${diag.diagnosticName}:`, fieldValue);

          if (!fieldValue) {
            console.warn(`⚠️ ADVERTENCIA: No se encontró el campo ${diag.diagnosticName} en el formulario`);
          }
        });

        console.log(
          "💊 Estado del formulario después de cargar diagnósticos:",
          Object.keys(formValues).reduce(
            (acc, key) => {
              // Solo mostrar claves que tienen valores
              if (
                Array.isArray(formValues[key as keyof typeof formValues]) &&
                (formValues[key as keyof typeof formValues] as any).length > 0
              ) {
                acc[key] = formValues[key as keyof typeof formValues];
              }
              return acc;
            },
            {} as Record<string, any>
          )
        );
      }, 100);
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
