"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  const handleDateUpdate = useCallback(
    (phaseId: string, startDate?: Date, endDate?: Date) => {
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
    },
    [updatePhase, projectId, milestone.id]
  );

  // Filtrar fases basado en el término de búsqueda
  const filteredPhases = useMemo(() => {
    if (!searchTerm.trim()) return milestone.phases;

    return milestone.phases.filter((phase) => phase.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [milestone.phases, searchTerm]);

  const columns = useMemo(
    () =>
      getPhasesProjectColumns({
        onDateUpdate: handleDateUpdate,
        milestoneStartDate: milestone.startDate,
        milestoneEndDate: milestone.endDate,
      } as any),
    [handleDateUpdate, milestone.startDate, milestone.endDate]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar fases..."
          className="h-8 w-64"
        />
      </div>

      <ContextMenuTable<PhaseDetailedResponseDto>
        columns={columns}
        data={filteredPhases}
        getRowId={(phase) => phase.id}
        onRowClick={handlePhaseClick}
        emptyMessage={searchTerm ? "No se encontraron fases" : "No hay fases en este hito"}
      />
    </div>
  );
}
