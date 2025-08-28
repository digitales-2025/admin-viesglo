"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileText,
  Flag,
  GitBranch,
  Tag,
  Target,
  XCircle,
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import { useMediaQuery } from "@/shared/hooks";
import { DeliverablePriority, ProjectTemplateDetailedResponseDto } from "../../../_types/templates.types";
import { deliverablePriorityConfig } from "../../../_utils/templates.utils";

interface ProjectTemplateViewerProps {
  template: ProjectTemplateDetailedResponseDto;
}

export function ProjectTemplateViewer({ template }: ProjectTemplateViewerProps) {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const enrichedMilestones = template.milestones?.map((milestone, milestoneIndex) => {
    const milestoneTemplate = template.milestoneTemplates?.find((mt) => mt.id === milestone.milestoneTemplateId);
    const milestoneOrder = milestoneIndex + 1;

    // Add hierarchical ordering to phases and deliverables
    const enrichedPhases =
      milestoneTemplate?.phases?.map((phase, phaseIndex) => {
        const phaseOrder = `${milestoneOrder}.${phaseIndex + 1}`;

        const enrichedDeliverables = phase.deliverables?.map((deliverable, deliverableIndex) => {
          const deliverableOrder = `${phaseOrder}.${deliverableIndex + 1}`;
          return {
            ...deliverable,
            order: deliverableOrder,
          };
        });

        return {
          ...phase,
          order: phaseOrder,
          deliverables: enrichedDeliverables,
        };
      }) || [];

    return {
      ...milestone,
      template: milestoneTemplate
        ? {
            ...milestoneTemplate,
            phases: enrichedPhases,
          }
        : undefined,
      order: milestoneOrder,
    };
  });

  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const findDeliverableName = (deliverableId: string): string => {
    // Buscar directamente en milestoneTemplates que contiene los datos completos
    for (const milestoneTemplate of template.milestoneTemplates ?? []) {
      if (milestoneTemplate.phases) {
        for (const phase of milestoneTemplate.phases) {
          const deliverable = phase.deliverables?.find((d) => d.id === deliverableId);
          if (deliverable) {
            return deliverable.name;
          }
        }
      }
    }
    return "Entregable no encontrado";
  };

  // Template Info Component (reusable for both desktop and mobile)
  const TemplateInfo = () => (
    <div className="space-y-6">
      {/* Template Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-muted-foreground text-sm">Vista de los detalles de la plantilla de proyecto</p>
          </div>
        </div>
        <h3 className="font-medium text-sm">Estado</h3>
        <Badge variant={template.isActive ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
          {template.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {template.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Template Description */}
      {template.description && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Descripción</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{template.description}</p>
        </div>
      )}

      {/* Tags */}
      {Array.isArray(template.tags) && template.tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="text-sm font-medium">Etiquetas</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {template.tags.map((tag) => (
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
        </div>
      )}

      {/* Template Stats */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Estadísticas</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total de hitos:</span>
            <Badge variant="outline">{enrichedMilestones?.length ?? 0}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total de fases:</span>
            <Badge variant="outline">
              {enrichedMilestones?.reduce((total, milestone) => total + (milestone.template?.phases?.length ?? 0), 0) ??
                0}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total de entregables:</span>
            <Badge variant="outline">
              {enrichedMilestones?.reduce(
                (total, milestone) =>
                  total +
                  (milestone.template?.phases?.reduce(
                    (phaseTotal, phase) => phaseTotal + (phase.deliverables?.length ?? 0),
                    0
                  ) ?? 0),
                0
              ) ?? 0}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  // Project Structure Component (reusable for both desktop and mobile)
  const ProjectStructure = () => (
    <div className="space-y-6">
      {/* Structure Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-muted">
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2>Estructura de Plantilla</h2>
            <p className="text-muted-foreground text-sm">Vista jerárquica con dependencias</p>
          </div>
        </div>
        <Badge variant="outline">{enrichedMilestones?.length ?? 0} Hitos</Badge>
      </div>

      {/* Project Structure Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-4 text-center font-semibold text-sm w-20">Orden</th>
                <th className="p-4 text-left font-semibold text-sm">Nombre de la Tarea</th>
                <th className="p-4 text-center font-semibold text-sm w-32">Estado</th>
                <th className="p-4 text-center font-semibold text-sm w-40">Estructura</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border">
              {(enrichedMilestones ?? []).map((milestone) => (
                <React.Fragment key={milestone.milestoneTemplateId}>
                  {/* Milestone Row */}
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-center">
                      <Badge variant="outline" className="font-mono text-sm">
                        {milestone.order}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMilestone(milestone.milestoneTemplateId)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {expandedMilestones.has(milestone.milestoneTemplateId) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <Flag className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">
                            {milestone.customName || milestone.template?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">{milestone.template?.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {milestone.isRequired ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{milestone.isRequired ? "Requerido" : "Opcional"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="relative h-6 bg-muted/30 rounded">
                        <div
                          className={`absolute left-0 top-0 h-full rounded bg-emerald-500 opacity-60`}
                          style={{ width: `100%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {milestone.template?.phases?.length || 0} fases
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Phases (when expanded) */}
                  {expandedMilestones.has(milestone.milestoneTemplateId) &&
                    milestone.template?.phases &&
                    milestone.template.phases.map((phase) => (
                      <React.Fragment key={phase.id}>
                        {/* Phase Row */}
                        <tr className="hover:bg-muted/20 transition-colors bg-muted/10">
                          <td className="p-4 pl-12 text-center">
                            <Badge variant="outline" className="font-mono text-xs">
                              {phase.order}
                            </Badge>
                          </td>
                          <td className="p-4 pl-12">
                            <div className="flex items-center gap-2">
                              <button onClick={() => togglePhase(phase.id)} className="p-1 hover:bg-muted rounded">
                                {expandedPhases.has(phase.id) ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                              <GitBranch className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                              <div>
                                <div className="font-medium text-sm">{phase.name}</div>
                                <div className="text-xs text-muted-foreground">{phase.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className="text-xs">
                              {phase.deliverables?.length ?? 0} entregables
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="relative h-5 bg-muted/30 rounded">
                              <div className="absolute left-0 top-0 h-full rounded bg-slate-500 opacity-50 w-full" />
                            </div>
                          </td>
                        </tr>

                        {/* Deliverables (when phase expanded) */}
                        {expandedPhases.has(phase.id) &&
                          (phase.deliverables ?? []).map((deliverable) => (
                            <tr key={deliverable.id} className="hover:bg-muted/10 transition-colors bg-muted/5">
                              <td className="p-3 pl-20 text-center">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {deliverable.order}
                                </Badge>
                              </td>
                              <td className="p-3 pl-20">
                                <div className="flex items-center gap-2">
                                  <FileCheck className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{deliverable.name}</div>
                                    <div className="text-xs text-muted-foreground">{deliverable.description}</div>
                                    {Array.isArray(deliverable.precedence) && deliverable.precedence.length > 0 && (
                                      <div className="text-xs text-orange-600 mt-1 flex gap-1 items-center">
                                        <ArrowRight className="h-3 w-3 text-orange-600 shrink-0" />
                                        {deliverable.precedence.map((precedence, index) => (
                                          <span key={precedence.deliverableId}>
                                            {findDeliverableName(precedence.deliverableId)}
                                            {index < (deliverable.precedence?.length ?? 0) - 1 && ", "}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {(() => {
                                  return (
                                    <Badge
                                      className={`text-xs mt-2 ${
                                        deliverablePriorityConfig[deliverable.priority as DeliverablePriority]
                                          ?.borderColor
                                      }`}
                                      variant={"outline"}
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full inline-block mr-2 ${
                                          deliverablePriorityConfig[deliverable.priority as DeliverablePriority]
                                            ?.dotClass ?? "bg-gray-400"
                                        }`}
                                      />
                                      {deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.label ??
                                        deliverable.priority}
                                    </Badge>
                                  );
                                })()}
                              </td>
                              <td className="p-3">
                                <div className="relative h-4 bg-muted/30 rounded">
                                  <div
                                    className={`absolute left-0 top-0 h-full rounded opacity-80 w-full ${
                                      deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.dotClass
                                    }`}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4  text-emerald-600 dark:text-emerald-400" />
          <span>Hitos</span>
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span>Fases</span>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Entregables</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-orange-600" />
          <span>Dependencias</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            1.2.3
          </Badge>
          <span>Orden jerárquico</span>
        </div>
      </div>
    </div>
  );

  // Mobile Layout
  if (!isDesktop) {
    return (
      <div className="space-y-6">
        {/* Mobile Info Panel (collapsible) */}
        <div className="bg-card border rounded-lg p-4">
          <TemplateInfo />
        </div>

        {/* Mobile Structure */}
        <div className="bg-card border rounded-lg p-4">
          <ProjectStructure />
        </div>
      </div>
    );
  }

  // Desktop Layout (original resizable)
  return (
    <div className="space-y-6">
      {/* Main Layout - Resizable Two Columns */}
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] border-0 border-t">
        {/* Left Column - Template Info */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full p-6 space-y-6 overflow-y-auto">
            <TemplateInfo />
          </div>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle withHandle />

        {/* Right Column - Project Structure */}
        <ResizablePanel defaultSize={70} minSize={30} maxSize={80}>
          <div className="h-full p-6 space-y-6 overflow-y-auto">
            <ProjectStructure />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
