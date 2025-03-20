"use client";

import { Loader2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useProjects } from "../_hooks/useProject";
import ProjectCard from "./ProjectCard";
import { ProjectsAdvancedSearch } from "./ProjectsAdvancedSearch";

export default function ProyectList() {
  const { data: projects, isLoading, error } = useProjects();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end items-center">
        <Button variant="outline">
          <Plus className="size-4 mr-2" />
          Agregar proyecto
        </Button>
      </div>
      <ProjectsAdvancedSearch onSearch={() => {}} />

      {isLoading && (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}
      {error && <div>Error: {error.message}</div>}
      {projects && projects.map((project) => <ProjectCard key={project.id} project={project} />)}
    </div>
  );
}
