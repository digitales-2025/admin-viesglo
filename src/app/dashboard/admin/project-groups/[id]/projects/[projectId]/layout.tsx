"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileCheck,
  Flag,
  Folder,
  GitBranch,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "@/shared/components/ui/kibo-ui/tree";
import { DeliverableDetailedResponseDto, MilestoneDetailedResponseDto, PhaseDetailedResponseDto } from "../_types";
import { ProjectProvider, useProjectContext } from "./_context/ProjectContext";
import { useOpenMilestoneStore } from "./_stores/useOpenMilestoneStore";

function ProjectHeader() {
  const { projectData, isLoading: isProjectLoading } = useProjectContext();
  const router = useRouter();
  const params = useParams();

  // Función para navegar a la página principal del proyecto
  const handleProjectClick = () => {
    const groupId = params.id as string;
    const projectId = params.projectId as string;
    router.push(`/dashboard/admin/project-groups/${groupId}/projects/${projectId}`);
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Cargando proyecto...</span>
      </div>
    );
  }

  if (!projectData) {
    return <div className="px-3 py-2 text-sm text-muted-foreground">Proyecto no encontrado</div>;
  }

  const totalPhases =
    projectData.milestones?.reduce(
      (acc: number, milestone: MilestoneDetailedResponseDto) => acc + (milestone.phases?.length || 0),
      0
    ) || 0;
  const totalDeliverables =
    projectData.milestones?.reduce(
      (acc: number, milestone: MilestoneDetailedResponseDto) =>
        acc +
        (milestone.phases?.reduce(
          (phaseAcc: number, phase: PhaseDetailedResponseDto) => phaseAcc + (phase.deliverables?.length || 0),
          0
        ) || 0),
      0
    ) || 0;

  return (
    <div className="px-4 py-4 border-b bg-muted/30">
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors group pb-4"
          onClick={handleProjectClick}
          title="Click para ir a la página principal del proyecto"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Folder className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="font-bold text-foreground truncate group-hover:text-primary transition-colors"
              title={projectData.name}
            >
              {projectData.name}
            </h2>
            <p
              className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors"
              title={projectData.description}
            >
              {projectData.description || "Proyecto sin descripción"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 bg-card/50 rounded-md border border-border/50">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-foreground">Hitos</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {projectData.milestones?.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-card/50 rounded-md border border-border/50">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-foreground">Fases</span>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{totalPhases}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-card/50 rounded-md border border-border/50">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-foreground">Entregables</span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{totalDeliverables}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentProjectTree() {
  const { projectData, isLoading: isProjectLoading } = useProjectContext();
  const currentProjectId = projectData?.id;

  if (isProjectLoading || !currentProjectId) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando estructura...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <TreeProvider
        showLines
        showIcons
        indent={16}
        className="pr-1"
        selectedIds={[currentProjectId]}
        defaultExpandedIds={[currentProjectId]}
        key={currentProjectId}
      >
        <TreeView>
          {projectData?.milestones?.map((milestone: MilestoneDetailedResponseDto) => (
            <MilestoneNode key={milestone.id} milestone={milestone} />
          ))}
        </TreeView>
      </TreeProvider>
    </div>
  );
}

function MilestoneNode({ milestone }: { milestone: MilestoneDetailedResponseDto }) {
  const totalPhases = milestone.phases?.length || 0;
  const totalDeliverables = milestone.phases?.reduce((acc, phase) => acc + (phase.deliverables?.length || 0), 0) || 0;
  const { openMilestoneId, toggleMilestone } = useOpenMilestoneStore();
  const pathname = usePathname();

  // Detectar si este milestone está seleccionado
  const isSelectedMilestone = openMilestoneId === milestone.id;

  // Detectar si estamos en una fase específica (no en la página principal del proyecto)
  const isInSpecificPhase = pathname.includes("/phase/");

  // Función para manejar el click en el milestone
  const handleMilestoneClick = () => {
    // Si estamos en una fase específica, no permitir cambiar de milestone
    if (isInSpecificPhase) {
      return;
    }
    toggleMilestone(milestone.id);
  };

  return (
    <TreeNode key={milestone.id} nodeId={milestone.id} level={1} className="mt-0.5">
      <TreeNodeTrigger
        className={`group transition-colors ${
          isInSpecificPhase ? "cursor-default opacity-60" : "cursor-pointer hover:bg-muted/50"
        } ${isSelectedMilestone ? "bg-primary/10 border-l-2 border-primary" : ""}`}
        onClick={handleMilestoneClick}
      >
        <TreeExpander hasChildren={totalPhases > 0} />
        <TreeIcon
          icon={
            <Flag
              className={`h-4 w-4 ${isSelectedMilestone ? "text-primary" : "text-emerald-600 dark:text-emerald-400"}`}
            />
          }
        />
        <div className="flex-1 flex items-center justify-between min-w-0">
          <TreeLabel
            title={milestone.name ?? "Hito"}
            className={`truncate ${isSelectedMilestone ? "font-semibold text-primary" : ""}`}
          >
            {milestone.name ?? "Hito"}
          </TreeLabel>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <span className="hidden group-hover:inline">{totalPhases} fases</span>
            <span className="hidden group-hover:inline">•</span>
            <span className="hidden group-hover:inline">{totalDeliverables} entregables</span>
          </div>
        </div>
      </TreeNodeTrigger>
      <TreeNodeContent hasChildren={totalPhases > 0} className="ml-2">
        {milestone.phases?.map((phase) => <PhaseNode key={phase.id} phase={phase} />)}
      </TreeNodeContent>
    </TreeNode>
  );
}

function PhaseNode({ phase }: { phase: PhaseDetailedResponseDto }) {
  const totalDeliverables = phase.deliverables?.length || 0;
  const progress = phase.progress || 0;
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Detectar si esta fase está activa
  const isActivePhase = pathname.includes(`/phase/${phase.id}`);

  // Función para navegar a la fase
  const handlePhaseClick = () => {
    const groupId = params.id as string;
    const projectId = params.projectId as string;
    router.push(`/dashboard/admin/project-groups/${groupId}/projects/${projectId}/phase/${phase.id}`);
  };

  return (
    <TreeNode key={phase.id} nodeId={phase.id} level={2} className="mt-0.5">
      <TreeNodeTrigger
        className={`group hover:bg-muted/50 transition-colors cursor-pointer ${
          isActivePhase ? "bg-primary/10 border-l-2 border-primary" : ""
        }`}
        onClick={handlePhaseClick}
      >
        <TreeExpander hasChildren={totalDeliverables > 0} />
        <TreeIcon
          icon={
            <GitBranch className={`h-4 w-4 ${isActivePhase ? "text-primary" : "text-slate-600 dark:text-slate-400"}`} />
          }
        />
        <div className="flex-1 flex items-center justify-between min-w-0">
          <TreeLabel
            title={phase.name ?? "Fase"}
            className={`truncate ${isActivePhase ? "font-semibold text-primary" : ""}`}
          >
            {phase.name ?? "Fase"}
          </TreeLabel>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isActivePhase ? "bg-primary" : "bg-slate-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="hidden group-hover:inline">{progress}%</span>
            </div>
            <span className="hidden group-hover:inline">•</span>
            <span className="hidden group-hover:inline">{totalDeliverables} entregables</span>
          </div>
        </div>
      </TreeNodeTrigger>
      <TreeNodeContent hasChildren={totalDeliverables > 0} className="ml-2">
        {phase.deliverables?.map((deliverable) => <DeliverableNode key={deliverable.id} deliverable={deliverable} />)}
      </TreeNodeContent>
    </TreeNode>
  );
}

function DeliverableNode({ deliverable }: { deliverable: DeliverableDetailedResponseDto }) {
  const progress = deliverable.progress || 0;
  const isCompleted = progress === 100;

  return (
    <TreeNode key={deliverable.id} nodeId={deliverable.id} level={3} className="mt-0.5">
      <TreeNodeTrigger className="group hover:bg-muted/50 transition-colors">
        <TreeExpander hasChildren={false} />
        <TreeIcon icon={<FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />} />
        <div className="flex-1 flex items-center justify-between min-w-0">
          <TreeLabel title={deliverable.name ?? "Entregable"} className="truncate">
            {deliverable.name ?? "Entregable"}
          </TreeLabel>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <div className="flex items-center gap-1">
              <div className="w-6 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${isCompleted ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="hidden group-hover:inline">{progress}%</span>
            </div>
            {deliverable.assignedTo && (
              <>
                <span className="hidden group-hover:inline">•</span>
                <div className="items-center gap-1 hidden group-hover:flex">
                  <Users className="h-3 w-3" />
                  <span>Asignado</span>
                </div>
              </>
            )}
          </div>
        </div>
      </TreeNodeTrigger>
    </TreeNode>
  );
}

function TrackingLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const params = useParams();
  const groupId = params.id as string;

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] relative">
      <aside className={`${sidebarOpen ? "block" : "hidden"} w-80 shrink-0 border-r bg-background/95 backdrop-blur-sm`}>
        <div className="h-full flex flex-col">
          {/* Header con navegación */}
          <div className="px-3 py-3 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/admin/project-groups/${groupId}/projects`}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  buttonVariants({ variant: "ghost", size: "sm" })
                )}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Volver a Proyectos</span>
              </Link>
            </div>
          </div>

          {/* Información del proyecto */}
          <ProjectHeader />

          {/* Tree de milestones */}
          <div className="flex-1 overflow-hidden">
            <CurrentProjectTree />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className="relative">
          {/* Botón toggle integrado con el header */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                aria-label={sidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
              <div className="flex-1" />
            </div>
          </div>
          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProvider projectId={projectId}>
      <TrackingLayoutContent>{children}</TrackingLayoutContent>
    </ProjectProvider>
  );
}
