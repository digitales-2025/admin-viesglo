/**
 * 📊 REPORT DIALOG COMPONENT
 *
 * Modal dialog for report generation with filters
 */

"use client";

import { useState } from "react";
import { Calendar, Download, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ServerDateRangeFacetedFilter } from "@/shared/components/filters/ServerDateRangeFacetedFilter";
import { Button } from "@/shared/components/ui/button";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import {
  prepareReportFilters,
  useAuditTraceabilityReport,
  useClientSatisfactionReport,
  useDeliverableApprovalReport,
  useMilestoneAnalysisReport,
  useProjectEfficiencyReport,
  useResourceCostReport,
  type ReportDateRange,
} from "@/shared/hooks/use-reports";
import type { ReportConfig } from "./config";

interface ReportDialogProps {
  config: ReportConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ config, open, onOpenChange }: ReportDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [dateRange, setDateRange] = useState<ReportDateRange>({});

  // ✅ SIEMPRE llamar todos los hooks (antes del early return)
  const projectEfficiency = useProjectEfficiencyReport();
  const milestoneAnalysis = useMilestoneAnalysisReport();
  const deliverableApproval = useDeliverableApprovalReport();
  const clientSatisfaction = useClientSatisfactionReport();
  const resourceCost = useResourceCostReport();
  const auditTraceability = useAuditTraceabilityReport();

  // Early return DESPUÉS de todos los hooks
  if (!config) return null;

  // Seleccionar el hook correcto según el config
  const hooks = {
    "project-efficiency": projectEfficiency,
    "milestone-analysis": milestoneAnalysis,
    "deliverable-approval": deliverableApproval,
    "client-satisfaction": clientSatisfaction,
    "resource-cost": resourceCost,
    "audit-traceability": auditTraceability,
  };

  const { generateReport, isDownloading } = hooks[config.id as keyof typeof hooks];

  const handleGenerate = () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error("Por favor selecciona un rango de fechas");
      return;
    }

    const filters = prepareReportFilters(dateRange);

    generateReport(filters);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      title={config.title}
      description={config.description}
      showTrigger={false}
      dialogContentClassName="sm:max-w-[600px] px-0"
    >
      <div className="space-y-6 py-4">
        {/* Filtro de fecha (obligatorio) */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rango de Fechas <span className="text-red-500">*</span>
          </label>
          <ServerDateRangeFacetedFilter
            title="Seleccionar rango"
            from={dateRange.from}
            to={dateRange.to}
            onChange={setDateRange}
            numberOfMonths={2}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Selecciona el periodo para el reporte (máximo 2 años)</p>
        </div>

        {/* Filtros adicionales opcionales */}
        {config.hasAdvancedFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Adicionales (Opcional)
            </label>
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Los filtros adicionales se aplicarán automáticamente según el contexto del reporte.
              </p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDownloading}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={isDownloading || !dateRange.from || !dateRange.to}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar Reporte
              </>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
