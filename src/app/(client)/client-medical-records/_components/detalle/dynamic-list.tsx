"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface DynamicListProps {
  label: string;
  items: string[];
  isEditing: boolean;
  onAdd: (value: string) => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function DynamicList({ label, items = [], isEditing, onAdd, onUpdate, onRemove }: DynamicListProps) {
  const [newItem, setNewItem] = useState("");

  // Ensure items is always an array to prevent the "items.map is not a function" error
  const safeItems = Array.isArray(items) ? items : [];

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="space-y-2">
        {safeItems.map((item, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            {isEditing ? (
              <Input
                value={item}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder="Ingrese valor"
                className="flex-1"
              />
            ) : (
              <div className="flex-1 py-2 px-3 border rounded-md bg-muted/20">{item}</div>
            )}
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                className="h-9 w-9 text-destructive"
              >
                <Trash className="h-4 w-4" />
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

        {safeItems.length === 0 && !isEditing && (
          <div className="text-sm text-muted-foreground italic py-2">No hay {label.toLowerCase()} registrados</div>
        )}
      </div>
    </div>
  );
}
