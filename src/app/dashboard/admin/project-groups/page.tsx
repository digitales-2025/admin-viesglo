"use client";

import { useState } from "react";
import { Grid, Plus, Table } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ProjectGroupsCards } from "./_components/cards/ProjectGroupsCards";
import { ProjectGroupsOverlays } from "./_components/project-groups-overlays/ProjectGroupsOverlays";
import ProjectGroupsTable from "./_components/table/ProjectGroupsTable";
import { useDeleteProjectGroup } from "./_hooks/use-project-groups";
import { ProjectGroupResponseDto } from "./_types/project-groups.types";

/**
 * Página principal de gestión de grupos de proyectos
 *
 * Características:
 * - Dos vistas: tarjetas (principal) y tabla (administrativa)
 * - Gestión de modales para crear/editar grupos
 * - Navegación futura a proyectos por grupo
 */
export default function PageProjectGroups() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentProjectGroup, setCurrentProjectGroup] = useState<ProjectGroupResponseDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectGroupToDelete, setProjectGroupToDelete] = useState<ProjectGroupResponseDto | null>(null);

  const { mutate: deleteProjectGroup, isPending: isDeleting } = useDeleteProjectGroup();

  const handleCreateNew = () => {
    setCurrentProjectGroup(null);
    setEditorOpen(true);
  };

  const handleEdit = (projectGroup: ProjectGroupResponseDto) => {
    setCurrentProjectGroup(projectGroup);
    setEditorOpen(true);
  };

  const handleViewProjects = (projectGroup: ProjectGroupResponseDto) => {
    // TODO: Navegar a la vista de proyectos del grupo
    console.log("Ver proyectos del grupo:", projectGroup.id);
  };

  const handleDelete = (projectGroup: ProjectGroupResponseDto) => {
    setProjectGroupToDelete(projectGroup);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectGroupToDelete) {
      deleteProjectGroup({
        params: { path: { id: projectGroupToDelete.id } },
      });
      setDeleteDialogOpen(false);
      setProjectGroupToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProjectGroupToDelete(null);
  };

  return (
    <div className="space-y-6">
      <ProjectGroupsOverlays
        editorOpen={editorOpen}
        onEditorOpenChange={setEditorOpen}
        currentProjectGroup={currentProjectGroup}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el grupo de proyectos{" "}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "cards" | "table")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Vista de Cartas
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Vista de Tabla
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards" className="space-y-6">
          <ProjectGroupsCards
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onViewProjects={handleViewProjects}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Grupos de Proyectos</h1>
              <p className="text-muted-foreground">Gestiona y organiza tus proyectos por grupos</p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
              Nuevo Grupo de Proyectos
            </Button>
          </div>
          <ProjectGroupsTable onEdit={handleEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
