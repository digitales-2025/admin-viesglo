/**
 * 📊 REPORTS DASHBOARD
 *
 * Main dashboard component for reports generation
 */

"use client";

import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ReportConfig, REPORTS_CONFIG } from "./reports/config";
import { ReportCard } from "./reports/ReportCard";
import { ReportDialog } from "./reports/ReportDialog";

export function ReportsDashboard() {
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGenerateReport = (config: ReportConfig) => {
    setSelectedReport(config);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Reportes</CardTitle>
          <CardDescription>Genera reportes ejecutivos con análisis detallado y métricas clave</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Grid de reportes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORTS_CONFIG.map((config) => (
              <ReportCard key={config.id} config={config} onGenerate={handleGenerateReport} />
            ))}
          </div>

          {/* Dialog de generación */}
          <ReportDialog config={selectedReport} open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
      </CardContent>
    </Card>
  );
}
