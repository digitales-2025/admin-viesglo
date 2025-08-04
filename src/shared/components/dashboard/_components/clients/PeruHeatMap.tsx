"use client";

import type React from "react";
import { useRef, useState } from "react";
import type { Feature } from "geojson";
import { MapPin, Minus, Move, Plus, ZoomIn } from "lucide-react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { peruDepartamental } from "@/shared/data/peru-departament";

// Datos de ejemplo de clientes por departamento
const clientesData = [
  { departamento: "Lima", clientes: 1500 },
  { departamento: "Arequipa", clientes: 20 },
  { departamento: "La Libertad", clientes: 380 },
  { departamento: "Piura", clientes: 320 },
  { departamento: "Cusco", clientes: 300 },
  { departamento: "Junín", clientes: 280 },
  { departamento: "Lambayeque", clientes: 250 },
  { departamento: "Ancash", clientes: 220 },
  { departamento: "Ica", clientes: 200 },
  { departamento: "Cajamarca", clientes: 180 },
  { departamento: "Huánuco", clientes: 150 },
  { departamento: "San Martín", clientes: 140 },
  { departamento: "Tacna", clientes: 130 },
  { departamento: "Ayacucho", clientes: 120 },
  { departamento: "Loreto", clientes: 110 },
  { departamento: "Puno", clientes: 100 },
  { departamento: "Ucayali", clientes: 90 },
  { departamento: "Huancavelica", clientes: 80 },
  { departamento: "Apurímac", clientes: 70 },
  { departamento: "Tumbes", clientes: 60 },
  { departamento: "Pasco", clientes: 50 },
  { departamento: "Moquegua", clientes: 45 },
  { departamento: "Amazonas", clientes: 40 },
  { departamento: "Madre de Dios", clientes: 30 },
  { departamento: "Callao", clientes: 200 },
];

// Función para obtener color basado en número de clientes
const getColor = (clientes: number) => {
  if (clientes > 1000) return "#800026"; // Rojo muy oscuro
  if (clientes > 500) return "#BD0026"; // Rojo oscuro
  if (clientes > 300) return "#E31A1C"; // Rojo
  if (clientes > 200) return "#FC4E2A"; // Rojo-naranja
  if (clientes > 100) return "#FD8D3C"; // Naranja
  if (clientes > 50) return "#FEB24C"; // Naranja claro
  if (clientes > 20) return "#FED976"; // Amarillo-naranja
  return "#FFEDA0"; // Amarillo muy claro
};

export default function PeruHeatMap() {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([-75, -9.5]);

  const maxClientes = Math.max(...clientesData.map((d) => d.clientes));
  const minClientes = Math.min(...clientesData.map((d) => d.clientes));

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
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {clientesData.reduce((sum, d) => sum + d.clientes, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientesData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mayor Concentración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{maxClientes.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Lima</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Menor Concentración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{minClientes.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Madre de Dios</p>
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
                onMouseMove={handleMouseMove}
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
                  <div
                    key={item.departamento}
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
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
