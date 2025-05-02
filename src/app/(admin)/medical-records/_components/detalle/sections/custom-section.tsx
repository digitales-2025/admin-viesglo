"use client";

import { useState } from "react";
import { Check, Edit, Plus, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NewFieldDialog } from "../new-field-dialog";

interface CustomSectionProps {
  section: any;
  sectionIndex: number;
  isEditing: boolean;
  onRemoveSection: () => void;
  onAddField: (name: string) => void;
  onUpdateField: (fieldIndex: number, field: string, value: string) => void;
  onRemoveField: (fieldIndex: number) => void;
  onEditSectionName: (newName: string) => void;
  onEditFieldName: (fieldIndex: number, newName: string) => void;
}

export function CustomSection({
  section,
  sectionIndex,
  isEditing,
  onRemoveSection,
  onAddField,
  onUpdateField,
  onRemoveField,
  onEditSectionName,
  onEditFieldName,
}: CustomSectionProps) {
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [editingSectionName, setEditingSectionName] = useState(false);
  const [tempSectionName, setTempSectionName] = useState(section.name);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [tempFieldName, setTempFieldName] = useState("");

  if (!section) return null;

  const existingFields = section.fields.map((field: any) => field.name);

  const handleEditSectionName = () => {
    if (tempSectionName.trim() !== "") {
      onEditSectionName(tempSectionName);
      setEditingSectionName(false);
    }
  };

  const handleEditFieldName = (fieldIndex: number) => {
    if (tempFieldName.trim() !== "") {
      onEditFieldName(fieldIndex, tempFieldName);
      setEditingFieldIndex(null);
    }
  };

  const startEditingField = (fieldIndex: number, currentName: string) => {
    setEditingFieldIndex(fieldIndex);
    setTempFieldName(currentName);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        {isEditing && editingSectionName ? (
          <div className="flex items-center gap-2 flex-1">
            <Input value={tempSectionName} onChange={(e) => setTempSectionName(e.target.value)} className="max-w-xs" />
            <Button type="button" variant="ghost" size="icon" onClick={handleEditSectionName} className="h-8 w-8">
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <CardTitle className="flex items-center gap-2">
            {section.name}
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditingSectionName(true)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        )}
        {isEditing && !editingSectionName && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemoveSection}
            className="text-destructive h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {section.fields.length === 0 && (
            <div className="text-sm text-muted-foreground italic py-2">No hay campos registrados en esta sección</div>
          )}

          {section.fields.map((field: any, fieldIndex: number) => (
            <div key={`field-${fieldIndex}`} className="space-y-3">
              <div className="flex items-center justify-between">
                {isEditing && editingFieldIndex === fieldIndex ? (
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
                      onClick={() => handleEditFieldName(fieldIndex)}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`field-${sectionIndex}-${fieldIndex}`}>{field.name}</Label>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingField(fieldIndex, field.name)}
                        className="h-6 w-6"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
                {isEditing && editingFieldIndex !== fieldIndex && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveField(fieldIndex)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditing ? (
                <Input
                  id={`field-${sectionIndex}-${fieldIndex}`}
                  value={field.value || ""}
                  onChange={(e) => onUpdateField(fieldIndex, "value", e.target.value)}
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
          onAddField={onAddField}
          existingFields={existingFields}
          title={`Agregar Campo en ${section.name}`}
        />
      </CardContent>
    </Card>
  );
}
