"use client";

import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface NewFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddField: (name: string) => void;
  existingFields: string[];
  title?: string;
}

export function NewFieldDialog({
  open,
  onOpenChange,
  onAddField,
  existingFields,
  title = "Agregar Nuevo Campo",
}: NewFieldDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre del campo es requerido");
      return;
    }

    if (existingFields.includes(name.trim())) {
      setError("Ya existe un campo con este nombre");
      return;
    }

    onAddField(name.trim());
    setName("");
    setError(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="field-name">Nombre del Campo</Label>
              <Input
                id="field-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
