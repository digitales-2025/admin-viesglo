"use client";

import { useState } from "react";
import { Check, Edit, Plus, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { DynamicList } from "../dynamic-list";
import { NewFieldDialog } from "../new-field-dialog";

interface DiagnosticosSectionProps {
  data: any;
  isEditing: boolean;
  onUpdateField: (field: string, value: any) => void;
  onAddCustomField: (name: string) => void;
  onUpdateCustomField: (index: number, field: string, value: string) => void;
  onRemoveCustomField: (index: number) => void;
  onAddHallazgo: (value: string) => void;
  onUpdateHallazgo: (index: number, value: string) => void;
  onRemoveHallazgo: (index: number) => void;
  onEditCustomField: (index: number, newName: string) => void;
}

export function DiagnosticosSection({
  data,
  isEditing,
  onUpdateField,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  onAddHallazgo,
  onUpdateHallazgo,
  onRemoveHallazgo,
  onEditCustomField,
}: DiagnosticosSectionProps) {
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [tempFieldName, setTempFieldName] = useState("");

  if (!data) return null;

  const existingFields = [
    "hallazgosLaboratorio",
    "diagnosticoOftalmologia",
    "diagnosticoMusculoesqueletico",
    "alteracionDiagnosticoPsicologia",
    "diagnosticoAudiometria",
    "diagnosticoEspirometria",
    "diagnosticoEkg",
    "resultadoTestSomnolencia",
  ].concat((data.customFields || []).map((field: any) => field.name));

  const handleEditFieldName = (index: number) => {
    if (tempFieldName.trim() !== "") {
      onEditCustomField(index, tempFieldName);
      setEditingFieldIndex(null);
    }
  };

  const startEditingField = (index: number, currentName: string) => {
    setEditingFieldIndex(index);
    setTempFieldName(currentName);
  };

  // Capitalizar solo la primera letra
  const capitalizeFirstLetter = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnósticos o conclusiones médicas por evaluación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <DynamicList
            label="Hallazgos de laboratorio"
            items={data.hallazgosLaboratorio || []}
            isEditing={isEditing}
            onAdd={onAddHallazgo}
            onUpdate={onUpdateHallazgo}
            onRemove={onRemoveHallazgo}
          />

          <div className="space-y-3">
            <Label htmlFor="diagnosticoOftalmologia">Diagnóstico oftalmología</Label>
            {isEditing ? (
              <Textarea
                id="diagnosticoOftalmologia"
                value={data.diagnosticoOftalmologia || ""}
                onChange={(e) => onUpdateField("diagnosticoOftalmologia", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.diagnosticoOftalmologia || "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="diagnosticoMusculoesqueletico">Diagnóstico musculoesquelético</Label>
            {isEditing ? (
              <Textarea
                id="diagnosticoMusculoesqueletico"
                value={data.diagnosticoMusculoesqueletico || ""}
                onChange={(e) => onUpdateField("diagnosticoMusculoesqueletico", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.diagnosticoMusculoesqueletico || "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="alteracionDiagnosticoPsicologia">Alteración / diagnóstico psicología</Label>
            {isEditing ? (
              <Textarea
                id="alteracionDiagnosticoPsicologia"
                value={data.alteracionDiagnosticoPsicologia || ""}
                onChange={(e) => onUpdateField("alteracionDiagnosticoPsicologia", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.alteracionDiagnosticoPsicologia || "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="diagnosticoAudiometria">Diagnóstico de audiometría</Label>
            {isEditing ? (
              <Textarea
                id="diagnosticoAudiometria"
                value={data.diagnosticoAudiometria || ""}
                onChange={(e) => onUpdateField("diagnosticoAudiometria", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.diagnosticoAudiometria || "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="diagnosticoEspirometria">Diagnóstico de espirometría</Label>
            {isEditing ? (
              <Textarea
                id="diagnosticoEspirometria"
                value={data.diagnosticoEspirometria || ""}
                onChange={(e) => onUpdateField("diagnosticoEspirometria", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.diagnosticoEspirometria || "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="diagnosticoEkg">Diagnóstico de EKG</Label>
            {isEditing ? (
              <Textarea
                id="diagnosticoEkg"
                value={data.diagnosticoEkg || ""}
                onChange={(e) => onUpdateField("diagnosticoEkg", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.diagnosticoEkg || "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="resultadoTestSomnolencia">Resultado test de somnolencia</Label>
            {isEditing ? (
              <Textarea
                id="resultadoTestSomnolencia"
                value={data.resultadoTestSomnolencia || ""}
                onChange={(e) => onUpdateField("resultadoTestSomnolencia", e.target.value)}
                rows={3}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                {data.resultadoTestSomnolencia || "No registrado"}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {(data.customFields || []).map((field: any, index: number) => (
            <div key={`custom-${index}`} className="space-y-3">
              <div className="flex items-center justify-between">
                {isEditing && editingFieldIndex === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={tempFieldName}
                      onChange={(e) => setTempFieldName(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditFieldName(index)}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`custom-${index}`}>{capitalizeFirstLetter(field.name)}</Label>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingField(index, field.name)}
                        className="h-6 w-6"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
                {isEditing && editingFieldIndex !== index && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveCustomField(index)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditing ? (
                <Textarea
                  id={`custom-${index}`}
                  value={field.value || ""}
                  onChange={(e) => onUpdateCustomField(index, "value", e.target.value)}
                  rows={3}
                />
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[75px] whitespace-pre-wrap">
                  {field.value || "No registrado"}
                </div>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddFieldDialogOpen(true)}
            className="mt-6"
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar Campo
          </Button>
        )}

        <NewFieldDialog
          open={isAddFieldDialogOpen}
          onOpenChange={setIsAddFieldDialogOpen}
          onAddField={onAddCustomField}
          existingFields={existingFields}
        />
      </CardContent>
    </Card>
  );
}
