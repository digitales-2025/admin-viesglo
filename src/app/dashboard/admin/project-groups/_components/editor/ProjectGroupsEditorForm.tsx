"use client";

import { FolderOpen, Tag } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { ProjectGroupFormData } from "../../_hooks/use-project-group-form";

interface ProjectGroupsEditorFormProps {
  form: UseFormReturn<ProjectGroupFormData>;
  onSubmit: (data: ProjectGroupFormData) => void;
  isUpdate?: boolean;
}

const STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

// Generar opciones de período dinámicamente (años 2022-2050, meses 01-02)
const generatePeriodOptions = () => {
  const options = [];
  const startYear = 2022; // Año de inicio 2022
  const endYear = 2050;

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 2; month++) {
      const value = `${year}-${month.toString().padStart(2, "0")}`;
      const label = `${year}-${month.toString().padStart(2, "0")}`;
      options.push({ value, label });
    }
  }

  return options;
};

const PERIOD_OPTIONS = generatePeriodOptions();

export default function ProjectGroupsEditorForm({ form, onSubmit, isUpdate: _isUpdate }: ProjectGroupsEditorFormProps) {
  return (
    <Form {...form}>
      <form id="project-group-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información Básica */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Información Básica</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del grupo de proyectos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción del grupo de proyectos" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Configuración */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Configuración</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERIOD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
