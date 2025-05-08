"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { MEDICAL_RECORDS_KEYS, useAddDiagnosticValue } from "../../_hooks/useMedicalRecords";

interface DiagnosticValue {
  diagnosticId: string | null;
  diagnosticName: string;
  id: string;
  medicalRecordId: string;
  value: string[];
}

interface DiagnosticManagerProps {
  recordId: string;
  diagnosticsValues: DiagnosticValue[];
  onDiagnosticAdded?: () => void;
}

export function DiagnosticManager({ recordId, diagnosticsValues, onDiagnosticAdded }: DiagnosticManagerProps) {
  const [isAddingDiagnostic, setIsAddingDiagnostic] = useState(false);
  const [diagnosticName, setDiagnosticName] = useState("");
  const [diagnosticValue, setDiagnosticValue] = useState("");
  const [diagnosticValues, setDiagnosticValues] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const addDiagnosticValue = useAddDiagnosticValue();

  // Verificar si ya existe un diagnóstico con el mismo nombre
  const diagnosticExists = (name: string) => {
    return diagnosticsValues.some((diag) => diag.diagnosticName.toLowerCase() === name.toLowerCase());
  };

  // Agregar un valor al diagnóstico actual
  const addValue = () => {
    if (diagnosticValue.trim()) {
      setDiagnosticValues([...diagnosticValues, diagnosticValue.trim()]);
      setDiagnosticValue("");
    }
  };

  // Eliminar un valor del diagnóstico actual
  const removeValue = (index: number) => {
    setDiagnosticValues(diagnosticValues.filter((_, i) => i !== index));
  };

  // Guardar el diagnóstico personalizado
  const saveDiagnostic = async () => {
    if (!diagnosticName.trim()) {
      toast.error("El nombre del diagnóstico es obligatorio");
      return;
    }

    if (diagnosticValues.length === 0) {
      toast.error("Debe agregar al menos un valor para el diagnóstico");
      return;
    }

    if (diagnosticExists(diagnosticName)) {
      toast.error("Ya existe un diagnóstico con este nombre");
      return;
    }

    try {
      // Crear el diagnóstico personalizado
      await addDiagnosticValue.mutateAsync({
        id: recordId,
        name: diagnosticName.trim(),
        values: diagnosticValues,
      });

      // Limpiar el formulario
      setDiagnosticName("");
      setDiagnosticValue("");
      setDiagnosticValues([]);
      setIsAddingDiagnostic(false);

      // Forzar la recarga de los datos para actualizar la interfaz inmediatamente
      // sin necesidad de guardar todo el formulario

      // Invalidar la consulta de diagnósticos específica
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(recordId)],
      });

      // Invalidar la consulta del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(recordId)],
      });

      // Notificar que se agregó un diagnóstico
      if (onDiagnosticAdded) {
        onDiagnosticAdded();
      }

      toast.success("Diagnóstico personalizado agregado correctamente");
    } catch (_error) {
      toast.error("Error al agregar diagnóstico personalizado");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Diagnósticos Personalizados</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAddingDiagnostic ? (
          <Button type="button" onClick={() => setIsAddingDiagnostic(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar diagnóstico personalizado
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostic-name" className="mb-2 block">
                Nombre del diagnóstico
              </Label>
              <Input
                id="diagnostic-name"
                placeholder="Ej: Evaluación personalizada"
                value={diagnosticName}
                onChange={(e) => setDiagnosticName(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">Valores del diagnóstico</Label>
              <div className="space-y-2">
                {diagnosticValues.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 py-2 px-3 border rounded-md bg-muted/20">{value}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeValue(index)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nuevo valor"
                    value={diagnosticValue}
                    onChange={(e) => setDiagnosticValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && diagnosticValue.trim()) {
                        e.preventDefault();
                        addValue();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addValue}
                    disabled={!diagnosticValue.trim()}
                    className="h-9 w-9"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {isAddingDiagnostic && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setIsAddingDiagnostic(false);
              setDiagnosticName("");
              setDiagnosticValue("");
              setDiagnosticValues([]);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={saveDiagnostic}
            disabled={!diagnosticName.trim() || diagnosticValues.length === 0 || addDiagnosticValue.isPending}
          >
            {addDiagnosticValue.isPending ? "Guardando..." : "Guardar diagnóstico"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
