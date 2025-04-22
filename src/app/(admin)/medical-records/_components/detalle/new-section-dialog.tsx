"use client";

import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface NewSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSection: (name: string) => void;
  existingSections: string[];
}

export function NewSectionDialog({ open, onOpenChange, onAddSection, existingSections }: NewSectionDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre de la sección es requerido");
      return;
    }

    if (existingSections.includes(name.trim())) {
      setError("Ya existe una sección con este nombre");
      return;
    }

    onAddSection(name.trim());
    setName("");
    setError(null);
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
          <DialogTitle>Agregar Nueva Sección</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="section-name">Nombre de la Sección</Label>
              <Input
                id="section-name"
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
