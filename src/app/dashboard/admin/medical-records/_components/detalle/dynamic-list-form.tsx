"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { Control, useController } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface DynamicListFormProps {
  label: string;
  name: string;
  control: Control<any>;
  isEditing: boolean;
  hideLabel?: boolean;
}

export function DynamicListForm({ label, name, control, isEditing, hideLabel = false }: DynamicListFormProps) {
  const [newItem, setNewItem] = useState("");

  // Use react-hook-form's controller to handle the field value
  const { field } = useController({
    name,
    control,
    defaultValue: [],
  });

  // Get the current items array, ensuring it's always an array of strings
  const items = Array.isArray(field.value)
    ? field.value
        .map((item: any) => {
          if (item === null || item === undefined) return "";
          return typeof item === "object" && "value" in item ? String(item.value || "") : String(item);
        })
        .filter(Boolean)
    : [];

  // Add a new item to the list
  const handleAdd = () => {
    if (newItem.trim()) {
      const newValues = [...items, newItem.trim()];
      field.onChange(newValues);
      setNewItem("");
    }
  };

  // Remove an item from the list
  const handleRemove = (index: number) => {
    const newValues = items.filter((_, i) => i !== index);
    field.onChange(newValues);
  };

  // Update an existing item
  const handleUpdate = (index: number, value: string) => {
    const newValues = [...items];
    newValues[index] = value;
    field.onChange(newValues);
  };

  return (
    <div className="space-y-3">
      {!hideLabel && <Label>{label}</Label>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${name}-${index}`} className="flex items-center gap-2">
            {isEditing ? (
              <Input
                value={item}
                onChange={(e) => handleUpdate(index, e.target.value)}
                placeholder="Ingrese valor"
                className="flex-1 outline-2 outline-emerald-600/50"
              />
            ) : (
              <div className="flex-1 py-2 px-3 border rounded-md bg-muted/20">{item || "No registrado"}</div>
            )}
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash className="h-4 w-4 text-rose-600" />
              </Button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="flex items-center gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Nuevo valor"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItem.trim()) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAdd}
              disabled={!newItem.trim()}
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {items.length === 0 && !isEditing && (
          <div className="text-sm text-muted-foreground italic py-2">No hay {label.toLowerCase()} registrados</div>
        )}
      </div>
    </div>
  );
}
