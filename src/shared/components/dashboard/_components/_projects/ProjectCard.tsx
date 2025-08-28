"use client";

import { useState } from "react";
import { Calendar, Clock, Eye, Files, FileText, Info, MonitorCog } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import BulletChart from "./BulletChart";
import BulletChartHighcharts from "./BulletChartHighcharts";

interface Project {
  id: number;
  company: string;
  consultant: string;
  status: string;
  deliverables: string;
  date: string;
  progress: number[];
  colors: string[];
  statusIcon: string;
  statusType: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showHighcharts, setShowHighcharts] = useState(false);

  const getStatusIcon = (iconType: string) => {
    switch (iconType) {
      case "calendar":
        return <Calendar className="w-4 h-4 shrink-0" />;
      case "implemented":
        return <FileText className="w-4 h-4 shrink-0" />;
      case "documented":
        return <Eye className="w-4 h-4 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Company Header */}
        <div className="flex items-center justify-between mb-3">
          <Info className="w-4 h-4" />
          <h3 className="font-semibold text-gray-900">{project.company}</h3>
          <button
            onClick={() => setShowHighcharts(!showHighcharts)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={showHighcharts ? "Ver gráfico simple" : "Ver gráfico avanzado"}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Bullet Chart Toggle */}
        <div className="mb-4">
          {showHighcharts ? (
            <BulletChartHighcharts
              containerId={`chart-${project.id}`}
              data={{ y: project.progress[0], target: project.progress[1], max: project.progress[2] }}
              categories={`<span class="hc-cat-title">${project.company}</span><br/>Progreso (%)`}
              plotBands={[
                { from: 0, to: 30, color: "rgb(230, 230, 250)" },
                { from: 30, to: 70, color: "rgb(230, 230, 250)" },
                { from: 70, to: 100, color: "rgb(230, 230, 250)" },
              ]}
              color={project.colors[0]}
              format="{value}%"
            />
          ) : (
            <BulletChart data={project.progress} colors={project.colors} />
          )}
        </div>

        {/* Consultant Info */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{project.consultant}</p>
          <p className="text-sm text-red-600">{project.status}</p>
          <p className="text-sm text-gray-600">{project.deliverables}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          {getStatusIcon(project.statusIcon)}
          <span className="text-xs">{project.date}</span>
        </div>
        {project.statusType === "implemented" && (
          <div className="flex items-center gap-1">
            <MonitorCog className="w-4 h-4 shrink-0" />
            <span className="text-xs">Implementado</span>
          </div>
        )}
        {project.statusType === "documented" && (
          <div className="flex items-center gap-1">
            <Files className="w-4 h-4 shrink-0" />
            <span className="text-xs">Documentado</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
