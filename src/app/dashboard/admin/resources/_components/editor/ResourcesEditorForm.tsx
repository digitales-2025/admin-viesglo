"use client";

import { FolderOpen, Tag } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ResourceCategory } from "../../_types/resources.types";

interface ResourcesEditorFormProps {
  form: UseFormReturn<{
    name: string;
    category: ResourceCategory;
  }>;
  onSubmit: (data: { name: string; category: ResourceCategory }) => void;
  isUpdate: boolean;
}

const CATEGORY_OPTIONS: { value: ResourceCategory; label: string }[] = [
  { value: "DIRECT_COSTS", label: "Directo" },
  { value: "INDIRECT_COSTS", label: "Indirecto" },
  { value: "EXPENSES", label: "Gastos" },
];

export default function ResourcesEditorForm({ form, onSubmit, isUpdate: _isUpdate }: ResourcesEditorFormProps) {
  return (
    <Form {...form}>
      <form id="resource-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
        {/* Información Básica */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <FolderOpen className="h-4 w-4" />
            </div>
            <h3>Información Básica</h3>
          </div>
          <div className="px-2 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                      Tipo de Recurso
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione el tipo de recurso" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      Nombre de recurso
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de recurso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>
      </form>
    </Form>
  );
}
