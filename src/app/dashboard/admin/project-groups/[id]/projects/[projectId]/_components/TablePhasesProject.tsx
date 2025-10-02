"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, FileText } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { ContextMenuTable } from "@/shared/components/ui/context-menu-table";
import { Input } from "@/shared/components/ui/input";
import { useUpdatePhase } from "../../_hooks/use-phase";
import { MilestoneDetailedResponseDto, PhaseDetailedResponseDto } from "../../_types";
import { getPhasesProjectColumns } from "./PhasesProjectColumn";

interface TablePhasesProjectProps {
  milestone: MilestoneDetailedResponseDto;
  projectId: string;
}

export default function TablePhasesProject({ milestone, projectId }: TablePhasesProjectProps) {
  const router = useRouter();
  const params = useParams();
  const [searchTerm, setSearch] = useState("");
  const { mutate: updatePhase } = useUpdatePhase();

  // Función para redirigir a la página de la fase
  const handlePhaseClick = (phase: PhaseDetailedResponseDto) => {
    const groupId = params.id as string;
    const projectId = params.projectId as string;
    const phaseId = phase.id;

    router.push(`/dashboard/admin/project-groups/${groupId}/projects/${projectId}/phase/${phaseId}`);
  };

  // Función para manejar la actualización del período de la fase
  const handleDateUpdate = (phaseId: string, startDate?: Date, endDate?: Date) => {
    updatePhase(
      {
        params: {
          path: {
            projectId,
            milestoneId: milestone.id,
            phaseId,
          },
        },
        body: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      },
      {
        onError: (error: any) => {
          console.error("Error al actualizar período de fase:", error);
        },
      }
    );
  };

  // Filtrar fases basado en el término de búsqueda
  const filteredPhases = useMemo(() => {
    if (!searchTerm.trim()) return milestone.phases;

    return milestone.phases.filter((phase) => phase.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [milestone.phases, searchTerm]);

  const columns = useMemo(() => getPhasesProjectColumns({ onDateUpdate: handleDateUpdate }), [handleDateUpdate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar fase..."
            className="h-8 w-64 bg-white dark:bg-background"
          />
          <Badge variant="outline" className="text-xs">
            {filteredPhases.length} de {milestone.phases.length} fases
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {milestone.phases.reduce((total, phase) => total + phase.deliverablesCount, 0)} entregables
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            {milestone.phases.reduce(
              (total, phase) => total + phase.deliverables.filter((d) => d.assignedTo).length,
              0
            )}{" "}
            asignados
          </Badge>
        </div>
      </div>

      <ContextMenuTable<PhaseDetailedResponseDto>
        columns={columns}
        data={filteredPhases}
        getRowId={(phase) => phase.id}
        onRowClick={handlePhaseClick}
        className="bg-white dark:bg-background"
        emptyMessage={searchTerm ? "No se encontraron fases" : "No hay fases en este hito"}
      />
    </div>
  );
}
