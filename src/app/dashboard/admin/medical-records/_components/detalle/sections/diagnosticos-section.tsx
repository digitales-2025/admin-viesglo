"use client";

import { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useUpdateDiagnosticValueName } from "../../../_hooks/useMedicalRecords";
import { DiagnosticManager } from "../diagnostic-manager";
import { DynamicListForm } from "../dynamic-list-form";

interface DiagnosticValue {
  diagnosticId: string | null;
  diagnosticName: string;
  id: string;
  medicalRecordId: string;
  value: string[];
}

interface DiagnosticosSectionProps {
  diagnosticsValues: DiagnosticValue[];
  isEditing: boolean;
  recordId: string;
  onDiagnosticsChange?: () => void;
}

type FormValues = {
  diagnosticos: Record<string, string[]>;
};

export function DiagnosticosSection({
  isEditing,
  diagnosticsValues,
  recordId,
  onDiagnosticsChange,
}: DiagnosticosSectionProps) {
  // Usar react-hook-form context
  const { control, setValue } = useFormContext<FormValues>();

  // Estado para diagnósticos personalizados
  const [_customDiagnostics, setCustomDiagnostics] = useState<string[]>([]);

  // Estado para el modal de edición
  const [editingDiagnostic, setEditingDiagnostic] = useState<{ id: string; name: string } | null>(null);
  const [newDiagnosticName, setNewDiagnosticName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Hook para actualizar el nombre del diagnóstico
  const updateDiagnosticName = useUpdateDiagnosticValueName();

  // Inicializar los valores de diagnóstico de forma dinámica desde los valores recibidos
  // para la lógica de seteo, para evitar ejecuciones extra.
  useEffect(() => {
    if (diagnosticsValues) {
      const formValuesToSet = diagnosticsValues.reduce(
        (acc, diag) => {
          if (diag.diagnosticName) {
            acc[diag.diagnosticName] = Array.isArray(diag.value)
              ? // Se mantiene el filtro original por ahora, se puede ajustar si es necesario
                diag.value.filter((v) => v !== null && v !== undefined && v !== "")
              : [];
          }
          return acc;
        },
        {} as Record<string, string[]>
      );
      setValue("diagnosticos", formValuesToSet, { shouldDirty: false, shouldValidate: false });

      // Identificar diagnósticos personalizados (sin diagnosticId)
      const customDiags = diagnosticsValues
        .filter((diag) => diag.diagnosticId === null)
        .map((diag) => diag.diagnosticName);

      // Actualizar el estado de customDiagnostics solo si ha cambiado para evitar re-renders innecesarios.
      // Es importante ordenar para una comparación consistente si el orden de customDiags puede variar.
      setCustomDiagnostics((prevCustomDiags) => {
        const sortedNewCustomDiags = [...customDiags].sort();
        const sortedPrevCustomDiags = [...prevCustomDiags].sort();
        if (JSON.stringify(sortedPrevCustomDiags) !== JSON.stringify(sortedNewCustomDiags)) {
          return customDiags; // Devolver el array original sin ordenar si se va a actualizar
        }
        return prevCustomDiags;
      });
    }
  }, [diagnosticsValues, setValue]); // Eliminamos getValues de las dependencias si no es estrictamente necesario
  // para la lógica de seteo, para evitar ejecuciones extra.

  // Manejar cuando se agrega un nuevo diagnóstico desde DiagnosticManager
  const handleDiagnosticAdded = () => {
    // Notificar al componente padre que los diagnósticos han cambiado
    if (onDiagnosticsChange) {
      onDiagnosticsChange();
    }
  };

  // Abrir el diálogo de edición para un diagnóstico personalizado
  const handleOpenEditDialog = (id: string, name: string) => {
    setEditingDiagnostic({ id, name });
    setNewDiagnosticName(name);
    setIsEditDialogOpen(true);
  };

  // Guardar el nuevo nombre del diagnóstico
  const handleSaveDiagnosticName = async () => {
    if (!editingDiagnostic) return;

    if (!newDiagnosticName.trim()) {
      toast.error("El nombre del diagnóstico no puede estar vacío");
      return;
    }

    try {
      await updateDiagnosticName.mutateAsync({
        diagnosticValueId: editingDiagnostic.id,
        name: newDiagnosticName.trim(),
        medicalRecordId: recordId,
      });

      toast.success("Nombre del diagnóstico actualizado correctamente");
      setIsEditDialogOpen(false);

      // Notificar al componente padre que los diagnósticos han cambiado
      if (onDiagnosticsChange) {
        onDiagnosticsChange();
      }
    } catch (_error) {
      toast.error("Error al actualizar el nombre del diagnóstico");
    }
  };

  // Ordenar los diagnósticos alfabéticamente por diagnosticName para mantener un orden constante
  const sortedDiagnostics = [...(diagnosticsValues || [])].sort((a, b) =>
    a.diagnosticName.localeCompare(b.diagnosticName)
  );

  // Identificar diagnósticos personalizados completos (con todo el objeto, no solo el nombre)
  const customDiagnosticsObjects = sortedDiagnostics.filter((diag) => diag.diagnosticId === null);

  return (
    <div className="space-y-6">
      {isEditing && (
        <DiagnosticManager
          recordId={recordId}
          diagnosticsValues={diagnosticsValues}
          onDiagnosticAdded={handleDiagnosticAdded}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diagnósticos o conclusiones médicas por evaluación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Renderizar primero los diagnósticos personalizados */}
            {customDiagnosticsObjects.map((diagnostic) => (
              <div key={`custom-${diagnostic.id}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{diagnostic.diagnosticName}</h3>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDialog(diagnostic.id, diagnostic.diagnosticName)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar nombre
                    </Button>
                  )}
                </div>
                <DynamicListForm
                  label={diagnostic.diagnosticName}
                  name={`diagnosticos.${diagnostic.diagnosticName}`}
                  control={control}
                  isEditing={isEditing}
                  hideLabel
                />
              </div>
            ))}

            {/* Renderizar todos los diagnósticos predefinidos */}
            {sortedDiagnostics
              .filter((diag) => diag.diagnosticId !== null)
              .map((diagnostic) => (
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

      {/* Diálogo para editar el nombre del diagnóstico */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nombre del diagnóstico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newDiagnosticName}
              onChange={(e) => setNewDiagnosticName(e.target.value)}
              placeholder="Nuevo nombre del diagnóstico"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDiagnosticName} disabled={updateDiagnosticName.isPending}>
              {updateDiagnosticName.isPending ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
