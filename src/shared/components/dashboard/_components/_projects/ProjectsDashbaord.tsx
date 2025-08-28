import { Search } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import ProjectCard from "./ProjectCard";

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "13/45 entregables",
    date: "31 de Julio 2025",
    progress: [45, 60, 100],
    colors: ["#FFC107", "#2196F3", "#E0E0E0"],
    statusIcon: "calendar",
    statusType: "risk",
  },
  {
    id: 2,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "36/52 entregables",
    date: "01 de Agosto 2025",
    progress: [90, 70, 100],
    colors: ["#2196F3", "#4CAF50", "#E0E0E0"],
    statusIcon: "implemented",
    statusType: "implemented",
  },
  {
    id: 3,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "32/62 entregables",
    date: "01 de Agosto 2025",
    progress: [56, 60, 100],
    colors: ["#4CAF50", "#8BC34A", "#E0E0E0"],
    statusIcon: "documented",
    statusType: "documented",
  },
  {
    id: 4,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "13/45 entregables",
    date: "31 de Julio 2025",
    progress: [45, 60, 100],
    colors: ["#FFC107", "#FF9800", "#E0E0E0"],
    statusIcon: "calendar",
    statusType: "risk",
  },
  {
    id: 5,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "16/42 entregables",
    date: "01 de Agosto 2025",
    progress: [28, 60, 100],
    colors: ["#F44336", "#FF5722", "#E0E0E0"],
    statusIcon: "implemented",
    statusType: "risk",
  },
  {
    id: 6,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "13/45 entregables",
    date: "31 de Julio 2025",
    progress: [45, 60, 100],
    colors: ["#FFC107", "#FF9800", "#E0E0E0"],
    statusIcon: "implemented",
    statusType: "risk",
  },
  {
    id: 7,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "32/62 entregables",
    date: "01 de Agosto 2025",
    progress: [56, 60, 100],
    colors: ["#4CAF50", "#8BC34A", "#E0E0E0"],
    statusIcon: "documented",
    statusType: "documented",
  },
  {
    id: 8,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "13/45 entregables",
    date: "31 de Julio 2025",
    progress: [45, 60, 100],
    colors: ["#FFC107", "#FF9800", "#E0E0E0"],
    statusIcon: "calendar",
    statusType: "risk",
  },
  {
    id: 9,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "13/45 entregables",
    date: "31 de Julio 2025",
    progress: [45, 60, 100],
    colors: ["#FFC107", "#FF9800", "#E0E0E0"],
    statusIcon: "calendar",
    statusType: "risk",
  },
  {
    id: 10,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "13/45 entregables",
    date: "31 de Julio 2025",
    progress: [45, 60, 100],
    colors: ["#FFC107", "#FF9800", "#E0E0E0"],
    statusIcon: "calendar",
    statusType: "risk",
  },
  {
    id: 11,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "16/42 entregables",
    date: "01 de Agosto 2025",
    progress: [28, 60, 100],
    colors: ["#F44336", "#FF5722", "#E0E0E0"],
    statusIcon: "implemented",
    statusType: "risk",
  },
  {
    id: 12,
    company: "Empresa",
    consultant: "Consultor Responsable",
    status: "Retraso: En riesgo",
    deliverables: "16/42 entregables",
    date: "01 de Agosto 2025",
    progress: [28, 60, 100],
    colors: ["#F44336", "#FF5722", "#E0E0E0"],
    statusIcon: "implemented",
    statusType: "risk",
  },
];

export default function ProjectsDashbaord() {
  return (
    <div className="p-6">
      <div>
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar proyecto" className="pl-10" />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm">
              A-Z ↑
            </Button>
            <Button variant="ghost" className="text-sm">
              Fecha de finalización ↑
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Tipo de proyecto
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Período
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Nivel de retraso
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                ⊞
              </Button>
              <Button variant="ghost" size="sm">
                ⊟
              </Button>
              <Button variant="ghost" size="sm">
                ≡
              </Button>
            </div>
          </div>
        </div>

        {/* Main Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Digitalización Empresarial - 2024</h2>
            <span className="text-sm text-gray-600">Avance general del grupo</span>
            <span className="text-lg font-semibold text-gray-900">40%</span>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-7">
            <div className="bg-primary h-7 rounded-full" style={{ width: "80%" }}></div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
