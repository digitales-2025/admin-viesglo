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
          return `En tiempo - Diferencia: ${difference.toFixed(2)}%`;
        case "ahead":
          return `Adelantado - ${difference.toFixed(2)}% por encima del objetivo`;
        case "acceptable-delay":
          return `Retraso aceptable - ${difference.toFixed(2)}% por debajo del objetivo`;
        case "critical-delay":
          return `Retraso crítico - ${difference.toFixed(2)}% por debajo del objetivo`;
        default:
          return "";
      }
    };

    const getDifferenceText = () => {
      if (difference <= tolerance) {
        return `Diferencia: ${difference.toFixed(2)}%`;
      } else if (isAhead) {
        return `+${difference.toFixed(2)}% del objetivo`;
      } else if (isBehind) {
        return `-${difference.toFixed(2)}% del objetivo`;
      }
      return "";
    };

    switch (hoveredSection) {
      case "current":
        return {
          title: current || "Progreso Actual",
          value: `${Number(current).toFixed(2)}%`,
          description: getStatusDescription(),
          difference: getDifferenceText(),
        };
      case "target":
        return {
          title: target || "Meta Objetivo",
          value: `${Number(target).toFixed(2)}%`,
          description: getStatusDescription(),
          difference: getDifferenceText(),
        };
      case "remaining":
        return {
          title: "Pendiente",
          value: `${Number(max - current).toFixed(2)}%`,
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
    const minDistance = 12; // Ajustado para mejor balance entre separación y visualización

    // Función auxiliar para verificar si dos posiciones están muy cerca
    const areTooClose = (pos1: number, pos2: number) => Math.abs(pos1 - pos2) < minDistance;

    // Casos especiales para valores 0 y 100
    const isTargetZero = targetPos === 0;
    const isCurrentZero = currentPos === 0;
    const isTargetMax = targetPos >= 100;
    const isCurrentMax = currentPos >= 100;

    // Verificar todas las posibles superposiciones PRIMERO
    const currentTargetClose = areTooClose(targetPos, currentPos);
    const currentMaxClose = areTooClose(currentPos, maxPos);
    const targetMaxClose = areTooClose(targetPos, maxPos);

    // ============================================
    // CASO 1: Ambos valores son 0
    // ============================================
    if (isTargetZero && isCurrentZero) {
      return {
        target: 0,
        current: null,
        max: null, // No mostrar max cuando ambos están en 0
      };
    }

    // ============================================
    // CASO 2: Ambos valores son 100
    // ============================================
    if (isTargetMax && isCurrentMax) {
      return {
        target: null,
        current: 100,
        max: null, // No mostrar max cuando ambos están en 100
      };
    }

    // ============================================
    // CASO 3: Los tres valores están muy cerca entre sí
    // ============================================
    if (currentTargetClose && currentMaxClose && targetMaxClose) {
      // Los tres están muy cerca, priorizar Current
      return {
        target: null,
        current: currentPos,
        max: null,
      };
    }

    // ============================================
    // CASO 4: Current está cerca de Target y Max (pero Target y Max no están tan cerca entre sí)
    // ============================================
    if (currentTargetClose && currentMaxClose && !targetMaxClose) {
      // Current en el medio de Target y Max, mostrar solo Current
      return {
        target: null,
        current: currentPos,
        max: null,
      };
    }

    // ============================================
    // CASO 5: Target está cerca de Current y Max (pero Current y Max no están tan cerca entre sí)
    // ============================================
    if (currentTargetClose && targetMaxClose && !currentMaxClose) {
      // Target en el medio, priorizar Current
      return {
        target: null,
        current: currentPos,
        max: null,
      };
    }

    // ============================================
    // CASO 6: Max está cerca de Current y Target (pero Current y Target no están tan cerca entre sí)
    // ============================================
    if (currentMaxClose && targetMaxClose && !currentTargetClose) {
      // Max en el medio, ocultar Max y mostrar Current y Target
      return {
        target: targetPos,
        current: currentPos,
        max: null,
      };
    }

    // ============================================
    // CASO 7: Current en 0 y Target cercano a Max
    // ============================================
    if (isCurrentZero && targetMaxClose) {
      // Current en 0, Target y Max están muy cerca
      // Mostrar Current (en 0) y Target, ocultar Max
      return {
        target: targetPos,
        current: 0,
        max: null, // Ocultar Max porque está muy cerca de Target
      };
    }

    // ============================================
    // CASO 8: Target en 0 y Current cercano a Max
    // ============================================
    if (isTargetZero && currentMaxClose) {
      // Target en 0, Current y Max están muy cerca
      // Mostrar Target (en 0) y Current, ocultar Max
      return {
        target: 0,
        current: currentPos,
        max: null, // Ocultar Max porque está muy cerca de Current
      };
    }

    // ============================================
    // CASO 9: Current en 0 con Target alto (pero no cercano a Max)
    // ============================================
    if (isCurrentZero && targetPos > 50 && !targetMaxClose) {
      // Current en 0, Target alto pero bien separado de Max
      return {
        target: targetPos,
        current: 0,
        max: maxPos,
      };
    }

    // ============================================
    // CASO 10: Target en 0 con Current alto (pero no cercano a Max)
    // ============================================
    if (isTargetZero && currentPos > 50 && !currentMaxClose) {
      // Target en 0, Current alto pero bien separado de Max
      return {
        target: 0,
        current: currentPos,
        max: maxPos,
      };
    }

    // ============================================
    // CASO 11: Current y Target están muy cerca (sin involucrar Max)
    // ============================================
    if (currentTargetClose && !currentMaxClose && !targetMaxClose) {
      // Current y Target muy cerca, priorizar Current
      if (isCurrentZero || isTargetZero) {
        // Si alguno está en 0, mostrar ambos
        return {
          target: targetPos,
          current: currentPos,
          max: maxPos,
        };
      } else {
        // Valores intermedios, priorizar Current
        return {
          target: null,
          current: currentPos,
          max: maxPos,
        };
      }
    }

    // ============================================
    // CASO 12: Current y Max están muy cerca (sin involucrar Target)
    // ============================================
    if (currentMaxClose && !currentTargetClose && !targetMaxClose) {
      // Current y Max muy cerca, priorizar Current
      return {
        target: targetPos,
        current: currentPos,
        max: null, // Ocultar Max porque está muy cerca de Current
      };
    }

    // ============================================
    // CASO 13: Target y Max están muy cerca (sin involucrar Current)
    // ============================================
    if (targetMaxClose && !currentTargetClose && !currentMaxClose) {
      // Target y Max muy cerca, priorizar Target y ocultar Max
      return {
        target: targetPos,
        current: currentPos,
        max: null, // Ocultar Max porque está muy cerca de Target
      };
    }

    // ============================================
    // CASO 14: No hay superposiciones - mostrar todos
    // ============================================
    return {
      target: targetPos,
      current: currentPos,
      max: maxPos,
    };
  };

  const labelPositions = getLabelPositions();

  return (
    <div className="w-full relative">
      {/* Bullet Chart Container */}
      <div
        className="relative w-full h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700"
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
          className={`absolute top-0 h-full transition-all duration-700 ease-out z-0 cursor-pointer group dark:bg-gray-700 ${
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
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-300" />
        </div>

        {/* Horizontal line from start to target */}
        {target && (
          <div
            className={`absolute top-1/2 h-0.5 transition-all duration-700 ease-out cursor-pointer group bg-black ${
              hoveredSection === "target" ? "shadow-lg" : ""
            }`}
            style={{
              left: "0%",
              width: `${animatedTarget}%`,
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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white dark:via-gray-300 to-transparent opacity-0 dark:opacity-10 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-300" />
          </div>
        )}

        {/* Target indicator circle */}
        {target && (
          <div
            className={`absolute top-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 shadow-lg transition-all duration-700 ease-out cursor-pointer group bg-black ${
              hoveredSection === "target" ? "scale-125 shadow-xl" : "scale-100"
            }`}
            style={{
              left: `calc(${animatedTarget}% - 6px)`,
              transform: "translateY(-50%)",
              zIndex: 60,
              transition: isAnimating
                ? `left ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "all 700ms ease-out",
            }}
            onMouseEnter={() => handleMouseEnter("target")}
            onMouseLeave={handleMouseLeave}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300 dark:from-gray-600 to-gray-100 dark:to-gray-400 opacity-0 group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-300" />
          </div>
        )}
      </div>

      {/* Percentage labels positioned correctly */}
      <div className="relative w-full mt-3 pb-4">
        {/* Target label positioned at target position - solo mostrar si no es null */}
        {labelPositions.target !== null && (
          <div
            className="absolute text-xs text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200 hover:text-gray-900 dark:hover:text-gray-100"
            style={{
              left: `${labelPositions.target}%`,
              transform: "translateX(-50%)",
            }}
          >
            {Number((animatedTarget / 100) * max).toFixed(1)}%
          </div>
        )}

        {/* Current label positioned at current position - solo mostrar si no es null */}
        {labelPositions.current !== null && (
          <div
            className="absolute text-xs text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200 hover:text-gray-900 dark:hover:text-gray-100"
            style={{
              left: `${labelPositions.current}%`,
              transform: "translateX(-50%)",
            }}
          >
            {Number((animatedCurrent / 100) * max).toFixed(1)}%
          </div>
        )}

        {/* Max label positioned at the end - solo mostrar si no hay superposición con otros labels */}
        {labelPositions.max !== null && (
          <div
            className="absolute text-xs text-gray-700 dark:text-gray-300 font-medium transition-colors duration-200 hover:text-gray-900 dark:hover:text-gray-100"
            style={{
              right: "0%",
            }}
          >
            {Number(max || 100).toFixed(1)}%
          </div>
        )}
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{tooltipContent.title}</h4>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{tooltipContent.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{Number(current).toFixed(2) || "Actual"}</p>
                </div>
                {target && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{Number(target).toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Number(target).toFixed(2) || "Objetivo"}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{tooltipContent.description}</p>
              {tooltipContent.difference && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{tooltipContent.difference}</p>
                </div>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800" />
          </div>
        </div>
      )}
    </div>
  );
}
