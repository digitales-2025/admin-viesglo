"use client";

import { Briefcase } from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectDetail from "./ProjectDetail";
import ProjectList from "./ProjectList";
import ProjectsDialogs from "./ProjectsDialogs";

export default function ProjectsContainer() {
  const { selectedProject } = useProjectStore();
  const isMobile = useIsMobile();

  return (
    <>
      <ProjectsDialogs />
      {isMobile ? (
        // Diseño móvil: Muestra solo la lista o el detalle según lo seleccionado
        <div className="h-full w-full flex flex-col border-y">
          {!selectedProject ? (
            <div className="py-4 flex-1 overflow-auto">
              <ProjectList />
            </div>
          ) : (
            <div className="p-4 flex-1 overflow-auto relative">
              <button
                onClick={() => useProjectStore.getState().setSelectedProject(null)}
                className="absolute top-4 left-4 z-10 p-2 bg-secondary rounded-full mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <ProjectDetail />
            </div>
          )}
        </div>
      ) : (
        // Diseño escritorio: Paneles redimensionables
        <ResizablePanelGroup
          direction="horizontal"
          className={cn(
            "h-full w-full border-y",
            "flex-1 overflow-hidden" // Permitir que se expanda sin tamaños fijos
          )}
        >
          <ResizablePanel defaultSize={35} minSize={30} maxSize={45} className="py-4 flex flex-col">
            <ProjectList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={55} className="p-4 flex flex-col">
            {selectedProject ? (
              <ProjectDetail />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Selecciona un proyecto</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona un proyecto para ver sus servicios y detalles
                </p>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </>
  );
}
