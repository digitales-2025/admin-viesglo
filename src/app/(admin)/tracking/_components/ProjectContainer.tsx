"use client";

import { Briefcase } from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectDetail from "./ProjectDetail";
import ProjectList from "./ProjectList";
import ProjectsDialogs from "./ProjectsDialogs";

export default function ProjectsContainer() {
  const { selectedProject } = useProjectStore();
  return (
    <>
      <ProjectsDialogs />
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full space-x-4"
      >
        <ResizablePanel defaultSize={40} minSize={30} className="py-4 flex flex-col">
          <ProjectList />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20} className="p-4">
          {selectedProject ? (
            <ProjectDetail />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Selecciona un proyecto</h3>
              <p className="text-sm text-muted-foreground">Selecciona un proyecto para ver sus servicios y detalles</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
