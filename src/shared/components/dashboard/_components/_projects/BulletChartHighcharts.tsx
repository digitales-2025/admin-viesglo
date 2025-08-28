"use client";

import { useEffect, useRef } from "react";
import Highcharts from "highcharts";

// Inicializar módulos de Highcharts
const initializeHighcharts = async () => {
  if (typeof Highcharts === "object") {
    try {
      // Cargar módulos de forma más segura
      const bulletModule = await import("highcharts/modules/bullet");
      const exportingModule = await import("highcharts/modules/exporting");
      const exportDataModule = await import("highcharts/modules/export-data");
      const accessibilityModule = await import("highcharts/modules/accessibility");

      // Inicializar los módulos de forma segura
      if (bulletModule && bulletModule.default) {
        (bulletModule.default as any)(Highcharts);
      }
      if (exportingModule && exportingModule.default) {
        (exportingModule.default as any)(Highcharts);
      }
      if (exportDataModule && exportDataModule.default) {
        (exportDataModule.default as any)(Highcharts);
      }
      if (accessibilityModule && accessibilityModule.default) {
        (accessibilityModule.default as any)(Highcharts);
      }
    } catch {}
  }
};

interface BulletChartData {
  y: number;
  target: number;
  max?: number; // Valor máximo opcional
}

interface BulletChartProps {
  containerId: string;
  data: BulletChartData;
  categories: string;
  plotBands: Array<{
    from: number;
    to: number;
    color: string;
  }>;
  color?: string;
  format?: string;
}

export default function BulletChartHighcharts({
  containerId,
  data,
  categories,
  plotBands,
  color = "#66f",
  format = "{value}",
}: BulletChartProps) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Inicializar Highcharts y crear el gráfico
    const setupChart = async () => {
      await initializeHighcharts();

      // Configuración global de Highcharts con tema claro
      (Highcharts as any).setOptions({
        chart: {
          inverted: true,
          marginLeft: 10,
          marginRight: 20,
          type: "bullet", // Restaurar a 'bullet'
          backgroundColor: "transparent", // Fondo transparente
          style: {
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          },
        },
        legend: {
          enabled: false,
        },
        xAxis: {
          labels: {
            style: {
              color: "#000000", // Cambiar a color negro
            },
            enabled: false, // Deshabilitar etiquetas del eje X
          },
          lineColor: "#666666",
          tickColor: "#666666",
        },
        yAxis: {
          gridLineWidth: 0,
          labels: {
            style: {
              color: "#333333", // Cambiar a color oscuro para tema claro
            },
          },
        },
        plotOptions: {
          series: {
            pointPadding: 0.25, // Restaurar pointPadding
            borderWidth: 0,
            targetOptions: {
              // Restaurar targetOptions para la línea de objetivo
              width: "200%",
              color: "#cccccc", // Color de la línea de objetivo
            },
          } as any,
        },
        credits: {
          enabled: false, // Deshabilitar créditos
        },
        exporting: {
          enabled: false,
        },
        tooltip: {
          backgroundColor: "#ffffff",
          borderColor: "#666666",
          style: {
            color: "#333333", // Cambiar a color oscuro para tema claro
          },
        },
      });

      // Crear el gráfico
      chartRef.current = (Highcharts as any).chart(containerId, {
        chart: {
          backgroundColor: "transparent", // Fondo transparente
          type: "bullet", // Restaurar a 'bullet'
        },
        title: {
          text: "", // Quitar el título
        },
        xAxis: {
          categories: [""], // Quitar las categorías
          labels: {
            enabled: false, // Deshabilitar las etiquetas del eje X
          },
          lineColor: "#666666",
          tickColor: "#666666",
        },
        yAxis: {
          plotBands,
          title: null,
          labels: {
            format,
            style: {
              color: "#000000", // Cambiar a color negro
            },
            step: 1, // Mostrar solo algunas etiquetas
            maxStaggerLines: 1, // Evitar múltiples líneas
          },
          gridLineWidth: 0,
          lineColor: "#666666",
          tickColor: "#666666",
          min: 0, // Valor mínimo del eje
          max: data.max || Math.max(data.y, data.target) + 20, // Usar data.max si existe, sino calcular
        },
        series: [
          {
            data: [
              {
                y: data.y,
                target: data.target,
              },
            ],
            color,
            targetOptions: {
              width: "200%",
              color: color, // Usar el mismo color que la barra
            },
          },
        ],
        tooltip: {
          pointFormat: "<b>{point.y}</b> (Objetivo: {point.target})", // Restaurar formato de tooltip
          backgroundColor: "#ffffff",
          borderColor: "#666666",
          style: {
            color: "#333333", // Cambiar a color oscuro para tema claro
          },
        },
      });
    };

    setupChart();

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [containerId, data, categories, plotBands, color, format]);

  return (
    <>
      <style jsx>{`
        #${containerId} {
          height: 90px;
          background-color: #ffff;
          border-radius: 4px;
        }

        .hc-cat-title {
          font-size: 13px;
          font-weight: bold;
          color: #ffffff;
        }

        .highcharts-figure,
        .highcharts-data-table table {
          min-width: 320px;
          max-width: 800px;
          margin: 1em auto;
        }

        .highcharts-data-table table {
          font-family: Verdana, sans-serif;
          border-collapse: collapse;
          border: 1px solid var(--highcharts-neutral-color-10, #0000);
          margin: 10px auto;
          text-align: center;
          width: 100%;
          max-width: 500px;
        }

        .highcharts-data-table caption {
          padding: 1em 0;
          font-size: 1.2em;
          color: var(--highcharts-neutral-color-60, #666);
        }

        .highcharts-data-table th {
          font-weight: 600;
          padding: 0.5em;
        }

        .highcharts-data-table td,
        .highcharts-data-table th,
        .highcharts-data-table caption {
          padding: 0.5em;
        }

        .highcharts-data-table thead tr,
        .highcharts-data-table tbody tr:nth-child(even) {
          background: var(--highcharts-neutral-color-3, #f7f7f7);
        }

        .highcharts-description {
          margin: 0.3rem 10px;
        }
      `}</style>
      <div id={containerId} className="w-full" />
    </>
  );
}
