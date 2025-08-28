"use client";

import { useMemo } from "react";

interface BulletChartProps {
  data: number[];
  colors: string[];
}

export default function BulletChart({ data, colors }: BulletChartProps) {
  const [current, target, max] = data;
  const [primaryColor] = colors;

  const currentPercentage = useMemo(() => Math.min((current / max) * 100, 100), [current, max]);
  const targetPercentage = useMemo(() => Math.min((target / max) * 100, 100), [target, max]);

  return (
    <div className="w-full">
      {/* Bullet Chart Container */}
      <div className="relative w-full h-5.5 bg-gray-100 rounded-full overflow-hidden">
        {/* Current progress section */}
        <div
          className="absolute top-0 left-0 h-full transition-all duration-700 ease-out z-0"
          style={{
            width: `${currentPercentage}%`,
            backgroundColor: primaryColor || "#FFD700", // Amarillo brillante como en la imagen
          }}
        />

        {/* Remaining section */}
        <div
          className="absolute top-0 h-full transition-all duration-700 ease-out z-0"
          style={{
            left: `${currentPercentage}%`,
            width: `${100 - currentPercentage}%`,
            backgroundColor: "#E6E6FA", // Lavanda claro como en la imagen
          }}
        />

        {/* Horizontal line from start to target */}
        {target && (
          <div
            className="absolute top-1/2 h-0.5 transition-all duration-700 ease-out"
            style={{
              left: "0%",
              width: `${targetPercentage}%`,
              backgroundColor: "#000000",
              transform: "translateY(-50%)",
              zIndex: 50,
            }}
          />
        )}

        {/* Target indicator circle */}
        {target && (
          <div
            className="absolute top-1/2 w-2 h-2 rounded-full border border-white shadow-sm transition-all duration-700 ease-out"
            style={{
              left: `calc(${targetPercentage}% - 4px)`,
              transform: "translateY(-50%)",
              backgroundColor: "#000000",
              zIndex: 60,
            }}
          />
        )}
      </div>

      {/* Percentage labels */}
      <div className="flex justify-between text-xs text-gray-700 mt-2">
        <span className="font-medium">{current || 0}%</span>
        {target && <span className="font-medium">{target || 0}%</span>}
        <span className="font-medium">{max || 100}%</span>
      </div>
    </div>
  );
}
