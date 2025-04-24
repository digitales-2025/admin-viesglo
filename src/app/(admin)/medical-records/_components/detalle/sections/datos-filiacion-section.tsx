"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, Edit, Plus, Trash } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { NewFieldDialog } from "../new-field-dialog";

interface DatosFiliacionSectionProps {
  data: any;
  isEditing: boolean;
  onUpdateField: (field: string, value: any) => void;
  onAddCustomField: (name: string) => void;
  onUpdateCustomField: (index: number, field: string, value: string) => void;
  onRemoveCustomField: (index: number) => void;
  onEditCustomField: (index: number, newName: string) => void;
}

export function DatosFiliacionSection({
  data,
  isEditing,
  onUpdateField,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  onEditCustomField,
}: DatosFiliacionSectionProps) {
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [tempFieldName, setTempFieldName] = useState("");

  if (!data) return null;

  const existingFields = [
    "dni",
    "nombres",
    "apellidoPaterno",
    "apellidoMaterno",
    "fechaIngreso",
    "edad",
    "genero",
    "fechaUltimoEmo",
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
        <CardTitle>Datos de filiación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="dni">DNI</Label>
            {isEditing ? (
              <Input id="dni" value={data.dni || ""} onChange={(e) => onUpdateField("dni", e.target.value)} />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.dni || "No registrado"}</div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="nombres">Nombres</Label>
            {isEditing ? (
              <Input
                id="nombres"
                value={data.nombres || ""}
                onChange={(e) => onUpdateField("nombres", e.target.value)}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.nombres || "No registrado"}</div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
            {isEditing ? (
              <Input
                id="apellidoPaterno"
                value={data.apellidoPaterno || ""}
                onChange={(e) => onUpdateField("apellidoPaterno", e.target.value)}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.apellidoPaterno || "No registrado"}</div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="apellidoMaterno">Apellido materno</Label>
            {isEditing ? (
              <Input
                id="apellidoMaterno"
                value={data.apellidoMaterno || ""}
                onChange={(e) => onUpdateField("apellidoMaterno", e.target.value)}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.apellidoMaterno || "No registrado"}</div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.fechaIngreso && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.fechaIngreso ? (
                      format(data.fechaIngreso, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.fechaIngreso}
                    onSelect={(date) => onUpdateField("fechaIngreso", date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">
                {data.fechaIngreso ? format(data.fechaIngreso, "PPP", { locale: es }) : "No registrado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="edad">Edad</Label>
            {isEditing ? (
              <Input
                id="edad"
                type="number"
                value={data.edad || ""}
                onChange={(e) => onUpdateField("edad", e.target.value)}
              />
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.edad || "No registrado"}</div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="genero">Género</Label>
            {isEditing ? (
              <Select value={data.genero || ""} onValueChange={(value) => onUpdateField("genero", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">{data.genero || "No registrado"}</div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="fechaUltimoEmo">Fecha último EMO ejecutado</Label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.fechaUltimoEmo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.fechaUltimoEmo ? (
                      format(data.fechaUltimoEmo, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.fechaUltimoEmo}
                    onSelect={(date) => onUpdateField("fechaUltimoEmo", date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="py-2 px-3 border rounded-md bg-muted/20">
                {data.fechaUltimoEmo ? format(data.fechaUltimoEmo, "PPP", { locale: es }) : "No registrado"}
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
