"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  FileCheck,
  Flag,
  Folder,
  GitBranch,
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
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { DeliverableDetailedResponseDto, MilestoneDetailedResponseDto, PhaseDetailedResponseDto } from "../_types";
import { ProjectBreadcrumbOverride } from "./_components/ProjectBreadcrumbOverride";
import { ProjectProvider, useProjectContext } from "./_context/ProjectContext";
import { useOpenMilestoneStore } from "./_stores/useOpenMilestoneStore";

function ProjectDescription({ description }: { description: string | null | undefined }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!description) return;

    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const displayText = description || "Proyecto sin descripción";
  const hasDescription = !!description;

  if (!hasDescription) {
    return (
      <p className="text-xs text-muted-foreground whitespace-normal wrap-break-word group-hover:text-foreground/80 transition-colors">
        {displayText}
      </p>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="text-xs text-muted-foreground whitespace-normal wrap-break-word group-hover:text-foreground/80 transition-colors line-clamp-2 cursor-help">
          {displayText}
        </p>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className="max-w-md p-0 cursor-pointer border shadow-lg bg-popover"
        onClick={handleCopy}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground whitespace-pre-wrap wrap-break-word leading-relaxed">
                {description}
              </p>
            </div>
            <div
              className={`shrink-0 p-1.5 rounded-md transition-all duration-200 ${
                copied
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <p
              className={`text-[11px] font-medium transition-colors ${
                copied ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              }`}
            >
              {copied ? "✓ Copiado al portapapeles" : "Click para copiar"}
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

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
      <div className="px-4 py-4 border-b bg-muted/30">
        <div className="space-y-4">
          {/* Skeleton del header del proyecto */}
          <div className="flex items-center gap-3 pb-4">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>

          {/* Skeleton de las estadísticas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-card/50 rounded-md border border-border/50">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-card/50 rounded-md border border-border/50">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-card/50 rounded-md border border-border/50">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        </div>
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
            <ProjectDescription description={projectData.description} />
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
      <div className="h-full overflow-y-auto px-3 py-2 space-y-2">
        {/* Skeleton de milestones */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-1">
            {/* Skeleton del milestone */}
            <div className="flex items-center gap-2 py-1.5 px-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className="h-4 w-32 flex-1" />
            </div>
            {/* Skeleton de fases (solo para algunos milestones) */}
            {index < 2 && (
              <div className="ml-6 space-y-1">
                {Array.from({ length: 2 }).map((_, phaseIndex) => (
                  <div key={phaseIndex} className="flex items-center gap-2 py-1 px-2">
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <Skeleton className="h-4 w-4 rounded shrink-0" />
                    <Skeleton className="h-4 w-28 flex-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Ordenar milestones por el número extraído del nombre (el campo order del backend está incorrecto)
  const sortedMilestones = [...(projectData?.milestones || [])].sort((a, b) => {
    // Función para extraer el número del nombre del hito
    const getOrderNumber = (milestone: MilestoneDetailedResponseDto): number => {
      const name = milestone.name || "";

      // Extraer el primer número del nombre (ejemplo: "Hito 1", "Hito 02", "Hito 3 HÍBRIDAS" -> 1, 2, 3)
      const numberMatch = name.match(/\d+/);
      if (numberMatch) {
        const extractedNum = parseInt(numberMatch[0], 10);
        if (!isNaN(extractedNum)) {
          return extractedNum;
        }
      }

      // Si no se puede extraer del nombre, usar el campo order del backend como fallback
      if (milestone.order !== undefined && milestone.order !== null) {
        const numOrder = typeof milestone.order === "number" ? milestone.order : Number(milestone.order);
        if (!isNaN(numOrder) && numOrder > 0) {
          return numOrder;
        }
      }

      // Si no se puede determinar, poner al final
      return Number.MAX_SAFE_INTEGER;
    };

    const orderA = getOrderNumber(a);
    const orderB = getOrderNumber(b);

    // Ordenar numéricamente
    return orderA - orderB;
  });

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
          {sortedMilestones.map((milestone: MilestoneDetailedResponseDto) => (
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

// Componente del contenido del sidebar (reutilizable)
function SidebarContent({ backUrl, backText }: { backUrl: string; backText: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto h-full">
      {/* Header con navegación */}
      <div className="px-3 py-3 border-b bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between">
          <Link
            href={backUrl}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              buttonVariants({ variant: "ghost", size: "sm" })
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>{backText}</span>
          </Link>
        </div>
      </div>

      {/* Información del proyecto */}
      <div className="shrink-0">
        <ProjectHeader />
      </div>

      {/* Tree de milestones */}
      <div className="flex-1 min-h-0 overflow-auto">
        <CurrentProjectTree />
      </div>
    </div>
  );
}

function TrackingLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const params = useParams();
  const pathname = usePathname();
  const groupId = params.id as string;
  const projectId = params.projectId as string;
  const isMobile = useIsMobile();

  // Detectar si estamos en una página de fase
  const isInPhasePage = pathname.includes("/phase/");

  // URL y texto del botón de navegación
  const backUrl = isInPhasePage
    ? `/dashboard/admin/project-groups/${groupId}/projects/${projectId}`
    : `/dashboard/admin/project-groups/${groupId}/projects`;
  const backText = isInPhasePage ? "Volver a Proyecto" : "Volver a Proyectos";

  return (
    <>
      <ProjectBreadcrumbOverride />
      <div className="flex h-full min-h-[calc(100vh-4rem)] relative">
        {/* Sidebar - Desktop: fijo, Mobile: Sheet */}
        {isMobile ? (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0 flex flex-col h-full">
              <SidebarContent backUrl={backUrl} backText={backText} />
            </SheetContent>
          </Sheet>
        ) : (
          <aside
            className={`${sidebarOpen ? "block" : "hidden"} w-80 shrink-0 border-r bg-background/95 backdrop-blur-sm flex flex-col h-full`}
          >
            <SidebarContent backUrl={backUrl} backText={backText} />
          </aside>
        )}

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
    </>
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
