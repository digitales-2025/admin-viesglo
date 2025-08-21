import { FileText, Tags, Type } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { CreateProjectTemplate } from "../../_schemas/projectTemplates.schemas";
import { TagResponseDto } from "../../_types/templates.types";
import { TagEditorDialog } from "../../../tags/_components/editor/TagEditorDialog";

interface CreateHeaderProjectTemplateFormProps {
  form: UseFormReturn<CreateProjectTemplate>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTagObjects: TagResponseDto[];
  setSelectedTagObjects: React.Dispatch<React.SetStateAction<TagResponseDto[]>>;
}

export default function CreateHeaderProjectTemplateForm({
  form,
  selectedTags,
  setSelectedTags,
  selectedTagObjects,
  setSelectedTagObjects,
}: CreateHeaderProjectTemplateFormProps) {
  return (
    <div className="space-y-3 mb-6">
      {/* Template Name */}
      <Form {...form}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground shrink-0" />
                Nombre de la plantilla
              </FormLabel>
              <FormControl>
                <Input placeholder="Ingresa el nombre de la plantilla" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>

      {/* Description Field */}
      <Form {...form}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                Descripción (Opcional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el propósito de esta plantilla..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>

      {/* Tags Section */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tags className="w-4 h-4 text-muted-foreground shrink-0" />
              Etiquetas
            </label>
            {selectedTagObjects.length > 0 && (
              <Badge variant="outline" className="text-xs h-fit">
                {selectedTagObjects.length} {selectedTagObjects.length === 1 ? "etiqueta" : "etiquetas"}
              </Badge>
            )}
          </div>
          <TagEditorDialog
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedTagObjects={selectedTagObjects}
            onTagObjectsChange={setSelectedTagObjects}
          />
        </div>

        {/* Tags Display */}
        <div className="px-3 py-1.5 border border-input rounded-md bg-background">
          {selectedTagObjects.length > 0 ? (
            <div className="flex flex-wrap gap-2 h-fit">
              {selectedTagObjects.map((tag) => (
                <Badge
                  key={tag.id}
                  className="text-xs h-fit flex items-center gap-1 border"
                  style={{
                    borderColor: tag.color,
                    color: tag.color,
                    backgroundColor: `${tag.color}10`,
                  }}
                >
                  <div className="w-3 h-3 rounded-full border border-current" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <Tags className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay etiquetas asignadas</p>
                <p className="text-xs text-muted-foreground/70">Haz clic en "Gestionar etiquetas" para agregar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
