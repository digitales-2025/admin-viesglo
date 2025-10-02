"use client";

import { useEffect, useMemo, useState } from "react";

interface BulletChartProps {
  current: number;
  target: number;
  showTooltip?: boolean;
  animationDuration?: number;
  tolerance?: number; // Tolerancia en porcentaje para considerar "en tiempo"
}

export default function BulletChart({
  current,
  target,
  showTooltip = true,
  animationDuration = 1500,
  tolerance = 5,
}: BulletChartProps) {
  const max = 100;
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [animatedCurrent, setAnimatedCurrent] = useState(0);
  const [animatedTarget, setAnimatedTarget] = useState(0);

  const currentPercentage = useMemo(() => Math.min((current / max) * 100, 100), [current, max]);
  const targetPercentage = useMemo(() => Math.min((target / max) * 100, 100), [target, max]);

  // Lógica de colores dinámicos basada en la relación current vs target
  const { primaryColor, status } = useMemo(() => {
    const difference = Math.abs(currentPercentage - targetPercentage);

    if (difference <= tolerance) {
      // En tiempo: diferencia <= 5%
      return {
        primaryColor: "#4CAF50", // Verde
        status: "on-time",
      };
    } else if (currentPercentage > targetPercentage) {
      // Adelantado: current > target + tolerancia
      return {
        primaryColor: "#2196F3", // Azul
        status: "ahead",
      };
    } else if (difference <= tolerance * 4) {
      // Retraso aceptable: diferencia <= 20%
      return {
        primaryColor: "#FFC107", // Amarillo
        status: "acceptable-delay",
      };
    } else {
      // Retraso crítico: diferencia > 20%
      return {
        primaryColor: "#F44336", // Rojo
        status: "critical-delay",
      };
    }
  }, [currentPercentage, targetPercentage, tolerance]);

  // Animación de entrada
  useEffect(() => {
    setIsAnimating(true);
    setAnimatedCurrent(0);
    setAnimatedTarget(0);

    const currentTimer = setTimeout(() => {
      setAnimatedCurrent(currentPercentage);
    }, 100);

    const targetTimer = setTimeout(() => {
      setAnimatedTarget(targetPercentage);
    }, 300);

    const animationCompleteTimer = setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);

    return () => {
      clearTimeout(currentTimer);
      clearTimeout(targetTimer);
      clearTimeout(animationCompleteTimer);
    };
  }, [currentPercentage, targetPercentage, animationDuration]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (section: string) => {
    setHoveredSection(section);
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
  };

  const getTooltipContent = () => {
    const difference = Math.abs(currentPercentage - targetPercentage);
    const isAhead = currentPercentage > targetPercentage;
    const isBehind = currentPercentage < targetPercentage;

    const getStatusDescription = () => {
      switch (status) {
        case "on-time":
          return `En tiempo - Diferencia: ${difference.toFixed(1)}%`;
        case "ahead":
          return `Adelantado - ${difference.toFixed(1)}% por encima del objetivo`;
        case "acceptable-delay":
          return `Retraso aceptable - ${difference.toFixed(1)}% por debajo del objetivo`;
        case "critical-delay":
          return `Retraso crítico - ${difference.toFixed(1)}% por debajo del objetivo`;
        default:
          return "";
      }
    };

    const getDifferenceText = () => {
      if (difference <= tolerance) {
        return `Diferencia: ${difference.toFixed(1)}%`;
      } else if (isAhead) {
        return `+${difference.toFixed(1)}% del objetivo`;
      } else if (isBehind) {
        return `-${difference.toFixed(1)}% del objetivo`;
      }
      return "";
    };

    switch (hoveredSection) {
      case "current":
        return {
          title: current || "Progreso Actual",
          value: `${current}%`,
          description: getStatusDescription(),
          difference: getDifferenceText(),
        };
      case "target":
        return {
          title: target || "Meta Objetivo",
          value: `${target}%`,
          description: getStatusDescription(),
          difference: getDifferenceText(),
        };
      case "remaining":
        return {
          title: "Pendiente",
          value: `${max - current}%`,
          description: getStatusDescription(),
          difference: getDifferenceText(),
        };
      default:
        return null;
    }
  };

  const tooltipContent = getTooltipContent();

  // Función para evitar superposición de labels
  const getLabelPositions = () => {
    const targetPos = animatedTarget;
    const currentPos = animatedCurrent;
    const maxPos = 100;

    // Distancia mínima entre labels (en porcentaje)
    const minDistance = 8;

    let targetLabelPos = targetPos;
    let currentLabelPos = currentPos;

    // Si target y current están muy cerca, reposicionar
    if (Math.abs(targetPos - currentPos) < minDistance) {
      if (targetPos < currentPos) {
        // Target a la izquierda, current a la derecha
        targetLabelPos = Math.max(0, targetPos - minDistance / 2);
        currentLabelPos = Math.min(100, currentPos + minDistance / 2);
      } else {
        // Current a la izquierda, target a la derecha
        currentLabelPos = Math.max(0, currentPos - minDistance / 2);
        targetLabelPos = Math.min(100, targetPos + minDistance / 2);
      }
    }

    // Si current está muy cerca del final, moverlo un poco hacia la izquierda
    if (currentLabelPos > 95) {
      currentLabelPos = 95;
    }

    return {
      target: targetLabelPos,
      current: currentLabelPos,
      max: maxPos,
    };
  };

  const labelPositions = getLabelPositions();

  return (
    <div className="w-full relative">
      {/* Bullet Chart Container */}
      <div
        className="relative w-full h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200"
        onMouseMove={handleMouseMove}
      >
        {/* Current progress section */}
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out z-0 cursor-pointer group ${
            hoveredSection === "current" ? "shadow-lg" : ""
          }`}
          style={{
            width: `${animatedCurrent}%`,
            backgroundColor: primaryColor,
            filter: hoveredSection === "current" ? "brightness(1.1)" : "brightness(1)",
            transform: hoveredSection === "current" ? "scaleY(1.05)" : "scaleY(1)",
            transition: isAnimating
              ? `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), background-color ${animationDuration}ms ease-out`
              : "all 700ms ease-out",
          }}
          onMouseEnter={() => handleMouseEnter("current")}
          onMouseLeave={handleMouseLeave}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
        </div>

        {/* Remaining section */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-out z-0 cursor-pointer group ${
            hoveredSection === "remaining" ? "shadow-lg" : ""
          }`}
          style={{
            left: `${animatedCurrent}%`,
            width: `${100 - animatedCurrent}%`,
            backgroundColor: "#E6E6FA",
            filter: hoveredSection === "remaining" ? "brightness(1.1)" : "brightness(1)",
            transform: hoveredSection === "remaining" ? "scaleY(1.05)" : "scaleY(1)",
            transition: isAnimating
              ? `left ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : "all 700ms ease-out",
          }}
          onMouseEnter={() => handleMouseEnter("remaining")}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
        </div>

        {/* Horizontal line from start to target */}
        {target && (
          <div
            className={`absolute top-1/2 h-0.5 transition-all duration-700 ease-out cursor-pointer group ${
              hoveredSection === "target" ? "shadow-lg" : ""
            }`}
            style={{
              left: "0%",
              width: `${animatedTarget}%`,
              backgroundColor: "#000000",
              transform: "translateY(-50%)",
              zIndex: 50,
              filter: hoveredSection === "target" ? "brightness(1.2)" : "brightness(1)",
              transition: isAnimating
                ? `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "all 700ms ease-out",
            }}
            onMouseEnter={() => handleMouseEnter("target")}
            onMouseLeave={handleMouseLeave}
          >
            {/* Line glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          </div>
        )}

        {/* Target indicator circle */}
        {target && (
          <div
            className={`absolute top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-700 ease-out cursor-pointer group ${
              hoveredSection === "target" ? "scale-125 shadow-xl" : "scale-100"
            }`}
            style={{
              left: `calc(${animatedTarget}% - 6px)`,
              transform: "translateY(-50%)",
              backgroundColor: "#000000",
              zIndex: 60,
              transition: isAnimating
                ? `left ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "all 700ms ease-out",
            }}
            onMouseEnter={() => handleMouseEnter("target")}
            onMouseLeave={handleMouseLeave}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300 to-gray-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          </div>
        )}
      </div>

      {/* Percentage labels positioned correctly */}
      <div className="relative w-full mt-3 pb-4">
        {/* Target label positioned at target position */}
        <div
          className="absolute text-xs text-gray-700 font-medium transition-colors duration-200 hover:text-gray-900"
          style={{
            left: `${labelPositions.target}%`,
            transform: "translateX(-50%)",
          }}
        >
          {Math.round((animatedTarget / 100) * max) || 0}%
        </div>

        {/* Current label positioned at current position */}
        <div
          className="absolute text-xs text-gray-700 font-medium transition-colors duration-200 hover:text-gray-900"
          style={{
            left: `${labelPositions.current}%`,
            transform: "translateX(-50%)",
          }}
        >
          {Math.round((animatedCurrent / 100) * max) || 0}%
        </div>

        {/* Max label positioned at the end */}
        <div
          className="absolute text-xs text-gray-700 font-medium transition-colors duration-200 hover:text-gray-900"
          style={{
            right: "0%",
          }}
        >
          {max || 100}%
        </div>
      </div>

      {/* Tooltip Card */}
      {showTooltip && tooltipContent && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
              <h4 className="font-semibold text-sm text-gray-900">{tooltipContent.title}</h4>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-lg font-bold text-gray-900">{tooltipContent.value}</p>
                  <p className="text-xs text-gray-500">{current || "Actual"}</p>
                </div>
                {target && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-700">{target}%</p>
                    <p className="text-xs text-gray-500">{target || "Objetivo"}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-2">{tooltipContent.description}</p>
              {tooltipContent.difference && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700">{tooltipContent.difference}</p>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
          </div>
        </div>
      )}
    </div>
  );
}
