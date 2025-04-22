"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { DynamicList } from "./dynamic-list";
import { NewFieldDialog } from "./new-field-dialog";

interface Field {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  conditional?: {
    field: string;
    value: string;
  };
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface MedicalRecordSectionProps {
  section: Section;
  data: any;
  onChange: (data: any) => void;
  displayMode: "accordion" | "card";
}

export function MedicalRecordSection({ section, data, onChange, displayMode }: MedicalRecordSectionProps) {
  const [isNewFieldDialogOpen, setIsNewFieldDialogOpen] = useState(false);

  const handleFieldChange = (fieldId: string, value: any) => {
    onChange({
      ...data,
      [fieldId]: value,
    });
  };

  const handleAddField = (fieldName: string) => {
    // Get the field key by converting the name to lowercase with underscores
    const fieldKey = fieldName.toLowerCase().replace(/\s+/g, "_");

    // Set default value based on the UI context - can be inferred from the dialog
    // Since we removed the type selector, we'll use an empty string as default
    onChange({
      ...data,
      [fieldKey]: "",
    });

    setIsNewFieldDialogOpen(false);
  };

  const renderField = (field: Field) => {
    // Check if this field should be conditionally displayed
    if (field.conditional) {
      const conditionMet = data[field.conditional.field] === field.conditional.value;
      if (!conditionMet) return null;
    }

    // Capitalizar solo la primera letra del texto
    const capitalizeFirstLetter = (text: string) => {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const label = capitalizeFirstLetter(field.label);

    switch (field.type) {
      case "text":
        return (
          <div className="grid gap-2">
            <Label htmlFor={`${section.id}-${field.id}`} className="font-medium">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${section.id}-${field.id}`}
              value={data[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
      case "number":
        return (
          <div className="grid gap-2">
            <Label htmlFor={`${section.id}-${field.id}`} className="font-medium">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={`${section.id}-${field.id}`}
              type="number"
              value={data[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );
      case "date":
        return (
          <div className="grid gap-2">
            <Label htmlFor={`${section.id}-${field.id}`} className="font-medium">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data[field.id] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data[field.id] ? format(new Date(data[field.id]), "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data[field.id] ? new Date(data[field.id]) : undefined}
                  onSelect={(date) => handleFieldChange(field.id, date ? date.toISOString() : "")}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      case "select":
        return (
          <div className="grid gap-2">
            <Label htmlFor={`${section.id}-${field.id}`} className="font-medium">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={data[field.id] || ""} onValueChange={(value) => handleFieldChange(field.id, value)}>
              <SelectTrigger id={`${section.id}-${field.id}`}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "textarea":
        return (
          <div className="grid gap-2">
            <Label htmlFor={`${section.id}-${field.id}`} className="font-medium">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={`${section.id}-${field.id}`}
              value={data[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              rows={4}
            />
          </div>
        );
      case "dynamic-list":
        return (
          <div className="grid gap-2">
            <Label className="font-medium">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <DynamicList
              label={label}
              items={data[field.id] || []}
              isEditing={true}
              onAdd={(value) => {
                const items = [...(data[field.id] || []), value];
                handleFieldChange(field.id, items);
              }}
              onUpdate={(index, value) => {
                const items = [...(data[field.id] || [])];
                items[index] = value;
                handleFieldChange(field.id, items);
              }}
              onRemove={(index) => {
                const items = [...(data[field.id] || [])];
                items.splice(index, 1);
                handleFieldChange(field.id, items);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const content = (
    <div className="space-y-6">
      {section.fields.map((field) => (
        <div key={field.id} className="space-y-4">
          {renderField(field)}
        </div>
      ))}

      {/* Custom fields that were added dynamically */}
      {Object.keys(data || {})
        .filter((key) => !section.fields.some((field) => field.id === key))
        .map((fieldId) => {
          const fieldType = Array.isArray(data[fieldId]) ? "dynamic-list" : "text";
          const fieldLabel = fieldId
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <div key={fieldId} className="space-y-2 relative">
              {renderField({
                id: fieldId,
                label: fieldLabel,
                type: fieldType,
              })}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  const newData = { ...data };
                  delete newData[fieldId];
                  onChange(newData);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

      <Button variant="outline" onClick={() => setIsNewFieldDialogOpen(true)} className="mt-4 gap-2">
        <Plus className="h-4 w-4" />
        Añadir Campo
      </Button>

      <NewFieldDialog
        open={isNewFieldDialogOpen}
        onOpenChange={setIsNewFieldDialogOpen}
        onAddField={handleAddField}
        existingFields={[
          ...section.fields.map((f) => f.label),
          ...Object.keys(data || {})
            .filter((key) => !section.fields.some((field) => field.id === key))
            .map((key) =>
              key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            ),
        ]}
      />
    </div>
  );

  if (displayMode === "accordion") {
    return (
      <AccordionItem value={section.id} className="border rounded-lg px-4">
        <AccordionTrigger className="py-4 text-lg font-semibold">{section.title}</AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">{content}</AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
