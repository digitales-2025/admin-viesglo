"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  MEDICAL_RECORDS_KEYS,
  useActiveDiagnostics,
  useAddDiagnostic,
  useAddDiagnosticValue,
} from "../../../../admin/medical-records/_hooks/useMedicalRecords";

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
  const [diagnosticName, setDiagnosticName] = useState("");
  const [diagnosticValue, setDiagnosticValue] = useState("");
  const [diagnosticValues, setDiagnosticValues] = useState<string[]>([]);
  const [addMode, setAddMode] = useState<"custom" | "existing" | null>(null);
  const [selectedExistingDiagnosticId, setSelectedExistingDiagnosticId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const addDiagnosticValue = useAddDiagnosticValue();
  const addNewDiagnostic = useAddDiagnostic();

  const { data: activeDiagnostics, isLoading: isLoadingActiveDiagnostics } = useActiveDiagnostics();

  const filteredAvailableDiagnostics =
    activeDiagnostics?.filter(
      (availDiag) => !diagnosticsValues.some((assignedDiag) => assignedDiag.diagnosticId === availDiag.id)
    ) || [];

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
  const saveCustomDiagnostic = async () => {
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
      setAddMode(null);

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

  const saveExistingDiagnostic = async () => {
    if (!selectedExistingDiagnosticId) {
      toast.error("Debe seleccionar un diagnóstico existente");
      return;
    }

    const selectedDiagnostic = activeDiagnostics?.find((d) => d.id === selectedExistingDiagnosticId);
    if (!selectedDiagnostic) {
      toast.error("Diagnóstico seleccionado no válido");
      return;
    }

    try {
      await addNewDiagnostic.mutateAsync({
        id: recordId,
        diagnostic: {
          diagnosticId: selectedExistingDiagnosticId,
          values: diagnosticValues,
        },
      });

      setSelectedExistingDiagnosticId(null);
      setDiagnosticValue("");
      setDiagnosticValues([]);
      setAddMode(null);

      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(recordId)],
      });
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(recordId)],
      });

      if (onDiagnosticAdded) {
        onDiagnosticAdded();
      }
      toast.success("Diagnóstico existente agregado correctamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al agregar diagnóstico existente";
      toast.error(errorMessage);
    }
  };

  const handleCancelAdd = () => {
    setAddMode(null);
    setDiagnosticName("");
    setDiagnosticValue("");
    setDiagnosticValues([]);
    setSelectedExistingDiagnosticId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Diagnósticos</CardTitle>
      </CardHeader>
      <CardContent>
        {addMode === null ? (
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => setAddMode("custom")}>
              <Plus className="mr-2 h-4 w-4" /> Agregar diagnóstico personalizado
            </Button>
            <Button type="button" variant="outline" onClick={() => setAddMode("existing")}>
              <Plus className="mr-2 h-4 w-4" /> Agregar diagnóstico existente
            </Button>
          </div>
        ) : addMode === "custom" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostic-name" className="mb-2 block">
                Nombre del diagnóstico personalizado
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
        ) : addMode === "existing" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="existing-diagnostic-select" className="mb-2 block">
                Seleccionar diagnóstico existente
              </Label>
              <Select
                value={selectedExistingDiagnosticId || ""}
                onValueChange={(value) => setSelectedExistingDiagnosticId(value)}
              >
                <SelectTrigger id="existing-diagnostic-select">
                  <SelectValue placeholder="Seleccione un diagnóstico..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingActiveDiagnostics ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : filteredAvailableDiagnostics.length > 0 ? (
                    filteredAvailableDiagnostics.map((diag) => (
                      <SelectItem key={diag.id} value={diag.id}>
                        {diag.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      No hay diagnósticos disponibles o ya están todos agregados.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Valores del diagnóstico (opcional)</Label>
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
        ) : null}
      </CardContent>

      {addMode === "custom" && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={handleCancelAdd}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={saveCustomDiagnostic}
            disabled={!diagnosticName.trim() || diagnosticValues.length === 0 || addDiagnosticValue.isPending}
          >
            {addDiagnosticValue.isPending ? "Guardando..." : "Guardar diagnóstico personalizado"}
          </Button>
        </CardFooter>
      )}

      {addMode === "existing" && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={handleCancelAdd}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={saveExistingDiagnostic}
            disabled={!selectedExistingDiagnosticId || addNewDiagnostic.isPending || isLoadingActiveDiagnostics}
          >
            {addNewDiagnostic.isPending ? "Guardando..." : "Guardar diagnóstico existente"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
