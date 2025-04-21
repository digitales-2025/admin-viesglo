"use client";

import { useState } from "react";
import { Check, Edit, Plus, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { NewFieldDialog } from "../new-field-dialog";

interface AptitudSectionProps {
  data: any;
  isEditing: boolean;
  onUpdateField: (field: string, value: any) => void;
  onAddCustomField: (name: string) => void;
  onUpdateCustomField: (index: number, field: string, value: string) => void;
  onRemoveCustomField: (index: number) => void;
  onEditCustomField: (index: number, newName: string) => void;
}

export function AptitudSection({
  data,
  isEditing,
  onUpdateField,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  onEditCustomField,
}: AptitudSectionProps) {
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [tempFieldName, setTempFieldName] = useState("");

  if (!data) return null;

  const existingFields = ["aptitud", "restricciones", "antecedentesPersonales"].concat(
    (data.customFields || []).map((field: any) => field.name)
  );

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
        <CardTitle>Aptitud</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-3">
            <Label htmlFor="aptitud">Aptitud</Label>
            {isEditing ? (
              <Select value={data.aptitud || ""} onValueChange={(value) => onUpdateField("aptitud", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar aptitud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apto">Apto</SelectItem>
                  <SelectItem value="No Apto">No Apto</SelectItem>
                  <SelectItem value="Apto con Restricciones">Apto con Restricciones</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.aptitud || "No registrado"}</div>
            )}
          </div>

          {(data.aptitud === "Apto con Restricciones" || data.restricciones) && (
            <div className="space-y-3">
              <Label htmlFor="restricciones">Restricciones</Label>
              {isEditing ? (
                <Textarea
                  id="restricciones"
                  value={data.restricciones || ""}
                  onChange={(e) => onUpdateField("restricciones", e.target.value)}
                  rows={4}
                />
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[100px] whitespace-pre-wrap">
                  {data.restricciones || "No registrado"}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="antecedentesPersonales">Antecedentes personales</Label>
            {isEditing ? (
              <Textarea
                id="antecedentesPersonales"
                value={data.antecedentesPersonales || ""}
                onChange={(e) => onUpdateField("antecedentesPersonales", e.target.value)}
                rows={4}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20 min-h-[100px] whitespace-pre-wrap">
                {data.antecedentesPersonales || "No registrado"}
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
                <Input
                  id={`custom-${index}`}
                  value={field.value || ""}
                  onChange={(e) => onUpdateCustomField(index, "value", e.target.value)}
                />
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/20">{field.value || "No registrado"}</div>
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
