/**
 * 📊 REPORT CARD COMPONENT
 *
 * Individual card for each report type
 */

"use client";

import { FileSpreadsheet } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { ReportConfig } from "./config";

interface ReportCardProps {
  config: ReportConfig;
  onGenerate: (config: ReportConfig) => void;
}

export function ReportCard({ config, onGenerate }: ReportCardProps) {
  const Icon = config.icon;

  return (
    <Card
      className={`transition-all hover:border-2 ${config.borderColor} cursor-pointer`}
      onClick={() => onGenerate(config)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
        </div>
        <CardTitle className="text-lg mt-3">{config.title}</CardTitle>
        <CardDescription className="text-sm">{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onGenerate(config);
          }}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </CardContent>
    </Card>
  );
}
