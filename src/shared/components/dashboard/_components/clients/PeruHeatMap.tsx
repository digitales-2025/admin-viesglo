"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Feature } from "geojson";
import { MapPin, Minus, Move, Plus, ZoomIn } from "lucide-react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { peruDepartamental } from "@/shared/data/peru-departament";
// type ClientEventPayload = {
//   type: "created" | "updated" | "deleted";
//   client: ClientSummary;
// };
import { useRealtimeSubscription } from "@/shared/hooks/use-realtime-subscription";
import { fetchClientsDashboardSummary } from "@/shared/lib/clients.service";

// Tipo para el ViewModel completo del dashboard
type DashboardSummary = {
  summary: {
    totalClients: number;
    departaments: Array<{ name: string; count: number }>;
    quarterlyGrowth: {
      currentQuarter: number;
      previousQuarter: number;
      growthPercentage: number;
      quarterLabel: string;
    };
    concentration: {
      highest: { department: string; count: number };
      lowest: { department: string; count: number };
    };
  };
  list: Array<{
    id: string;
    name?: string;
    ruc?: string;
    email?: string;
    sunatInfo?: { department?: string; [k: string]: unknown };
    createdAt?: Date;
  }>;
  meta: {
    source: string;
    at: string;
    lastUpdated: string;
  };
};

// Construye arreglo consumible por el mapa desde el ViewModel agregado del backend
function buildClientesDataFromSummary(summary: DashboardSummary["summary"] | undefined) {
  if (!summary) return [] as Array<{ departamento: string; clientes: number }>;
  return summary.departaments.map((d) => ({ departamento: d.name, clientes: d.count }));
}

// Función para obtener color basado en número de clientes
const getColor = (clientes: number) => {
  if (clientes > 100) return "#800026"; // Rojo muy oscuro
  if (clientes > 50) return "#BD0026"; // Rojo oscuro
  if (clientes > 30) return "#E31A1C"; // Rojo
  if (clientes > 20) return "#FC4E2A"; // Rojo-naranja
  if (clientes > 10) return "#FD8D3C"; // Naranja
  if (clientes > 5) return "#FEB24C"; // Naranja claro
  if (clientes > 2) return "#FED976"; // Amarillo-naranja
  return "#FFEDA0"; // Amarillo muy claro
};

export default function PeruHeatMap() {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([-75, -9.5]);

  // Fase 1: carga inicial (ViewModel agregado completo desde el backend)
  const { data: summaryData } = useQuery({
    queryKey: ["clients", "dashboard", "summary"],
    queryFn: fetchClientsDashboardSummary,
    staleTime: 60_000,
  });

  // Extraer métricas del ViewModel completo
  const dashboardData = summaryData as DashboardSummary | undefined;
  const clientesData = buildClientesDataFromSummary(dashboardData?.summary);
  const quarterlyGrowth = dashboardData?.summary?.quarterlyGrowth;
  const concentration = dashboardData?.summary?.concentration;

  // Calcular métricas para compatibilidad con código existente
  const maxClientes =
    concentration?.highest?.count || (clientesData.length ? Math.max(...clientesData.map((d) => d.clientes)) : 0);
  const minClientes =
    concentration?.lowest?.count || (clientesData.length ? Math.min(...clientesData.map((d) => d.clientes)) : 0);
  const totalClientes = dashboardData?.summary?.totalClients || clientesData.reduce((sum, d) => sum + d.clientes, 0);
  const highestDepartment = concentration?.highest?.department || "Lima";
  const lowestDepartment = concentration?.lowest?.department || "Madre de Dios";

  // Fase 2: actualizaciones en tiempo real (ViewModel ya agregado desde el backend)
  useRealtimeSubscription(
    "clients/dashboard/stream",
    ["clients", "dashboard", "summary"],
    (_oldData: unknown, payload: unknown) => {
      // Reemplazar directamente con el ViewModel que publica el backend
      return payload as any;
    }
  );

  const getClientesForDepartment = (deptName: string) => {
    const dept = clientesData.find(
      (d) =>
        d.departamento.toLowerCase() === deptName.toLowerCase() ||
        deptName.toLowerCase().includes(d.departamento.toLowerCase()) ||
        d.departamento.toLowerCase().includes(deptName.toLowerCase())
    );
    return dept?.clientes || 0;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  // Zoom centrado en el mapa (para botones)
  const handleZoomCentered = (factor: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(0.5, Math.min(prevZoom * factor, 4));
      return newZoom;
    });
    // Siempre centrar en el centro fijo del mapa de Perú
    setCenter([-75, -9.5]);
  };

  return (
    <div className="w-full space-y-6">
      {/* Estadísticas Mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalClientes.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{quarterlyGrowth?.quarterLabel || "Q4 2024"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento Trimestral</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(quarterlyGrowth?.growthPercentage || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {quarterlyGrowth?.growthPercentage?.toFixed(1) || "0.0"}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {quarterlyGrowth?.currentQuarter || 0} vs {quarterlyGrowth?.previousQuarter || 0} anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientesData.length}</div>
            <p className="text-xs text-gray-500 mt-1">Con clientes activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mayor Concentración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{maxClientes.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{highestDepartment}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menor Concentración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{minClientes.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{lowestDepartment}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-3">
          <Card className="py-0 pt-6">
            <CardHeader>
              <CardTitle>Mapa de Calor de Clientes por Departamento</CardTitle>
              <CardDescription>
                {selectedDept ? (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>
                      Departamento seleccionado: <span className="font-semibold">{selectedDept}</span> –
                      <span className="font-bold text-red-600 ml-1">
                        {getClientesForDepartment(selectedDept).toLocaleString()} clientes
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>Explora el mapa y selecciona un departamento para ver sus clientes.</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div
                ref={mapRef}
                className="w-full h-[427px] rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing"
              >
                {peruDepartamental && (
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      scale: 1200, // Aumentado para hacer el mapa más grande
                      center: [-75, -9.5],
                    }}
                    width={600}
                    height={400}
                    style={{ width: "100%", height: "100%" }}
                    onMouseMove={handleMouseMove}
                  >
                    <ZoomableGroup zoom={zoom} minZoom={0.5} maxZoom={4} center={center}>
                      <Geographies geography={peruDepartamental}>
                        {({ geographies }: { geographies: Feature[] }) =>
                          geographies.map((geo: Feature, idx: number) => {
                            const deptName = geo.properties?.NOMBDEP ?? "";
                            const clientes = getClientesForDepartment(deptName);
                            const isSelected = selectedDept === deptName;

                            return (
                              <Geography
                                key={deptName || idx}
                                geography={geo}
                                fill={getColor(clientes)}
                                stroke="#ffffff"
                                strokeWidth={isSelected ? 2 : 1}
                                style={{
                                  default: { outline: "none", cursor: "pointer" },
                                  hover: { outline: "none", filter: "brightness(1.1)", cursor: "pointer" },
                                  pressed: { outline: "none", cursor: "pointer" },
                                }}
                                onMouseEnter={() => setHoveredDept(deptName)}
                                onMouseLeave={() => setHoveredDept(null)}
                                onClick={() => setSelectedDept(selectedDept === deptName ? null : deptName)}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                )}

                {/* Tooltip flotante */}
                {hoveredDept && (
                  <div
                    role="tooltip"
                    aria-hidden={!hoveredDept}
                    className="absolute pointer-events-none z-10 bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 transform -translate-x-1/2 -translate-y-full select-none"
                    style={{
                      left: mousePosition.x,
                      top: mousePosition.y - 10,
                    }}
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getColor(getClientesForDepartment(hoveredDept)) }}
                      ></div>
                      <span className="font-medium text-sm text-gray-900">{hoveredDept}</span>
                      <span className="text-sm text-gray-600">
                        {getClientesForDepartment(hoveredDept).toLocaleString()} clientes
                      </span>
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-white"></div>
                      <div className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-200"></div>
                    </div>
                  </div>
                )}

                {/* Controles de zoom */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleZoomCentered(1.5)}
                    disabled={zoom >= 4}
                    className="w-8 h-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleZoomCentered(1 / 1.5)}
                    disabled={zoom <= 0.5}
                    className="w-8 h-8"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <CardFooter className="flex justify-center items-center mt-4 py-3">
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Selecciona un departamento
                  </span>
                  <span className="mx-1"></span>
                  <span className="inline-flex items-center gap-1">
                    <ZoomIn className="w-4 h-4" />
                    Zoom con rueda
                  </span>
                  <span className="mx-1"></span>
                  <span className="inline-flex items-center gap-1">
                    <Move className="w-4 h-4" />
                    Arrastra para mover
                  </span>
                </div>
              </CardFooter>
            </CardContent>
          </Card>
        </div>

        {/* Leyenda y Top Departamentos */}
        <div className="space-y-6">
          {/* Top 10 Departamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Departamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientesData
                .sort((a, b) => b.clientes - a.clientes)
                .slice(0, 10)
                .map((item, index) => (
                  <button
                    type="button"
                    key={item.departamento}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedDept(selectedDept === item.departamento ? null : item.departamento);
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      selectedDept === item.departamento ? "bg-blue-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedDept(selectedDept === item.departamento ? null : item.departamento)}
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium">{item.departamento}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(item.clientes) }}></div>
                      <span className="text-sm font-bold">{item.clientes.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
