"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface LoadingTransitionProps {
  show: boolean;
  message?: string;
  submessage?: string;
  className?: string;
  variant?: "chess" | "geometric" | "minimal";
}

export function LoadingTransition({
  show,
  message = "Cargando...",
  submessage = "Por favor espera",
  className,
  variant = "chess",
}: LoadingTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const interval = setInterval(() => {}, 200);
      return () => clearInterval(interval);
    }
  }, [show]);

  if (!mounted) return null;

  const ChessLoader = () => (
    <div className="relative">
      {/* Animated chessboard */}
      <div className="grid grid-cols-6 gap-0.5 w-20 h-20 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square transition-all duration-700 ease-in-out",
              (Math.floor(i / 6) + i) % 2 === 0 ? "bg-primary" : "bg-primary/10"
            )}
            style={{
              animationDelay: `${i * 50}ms`,
              transform: `scale(${0.8 + Math.sin(Date.now() / 1000 + i) * 0.2})`,
              animation: `pulse 2s infinite ${i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Chess pieces positioned in specific squares to avoid overlap */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Knight moving between specific squares */}
        <div
          className="absolute text-sm opacity-80 transition-all duration-2000 ease-in-out z-10"
          style={{
            animation: "knightMoveGrid 4s infinite ease-in-out",
          }}
        >
          ♞
        </div>

        {/* Rook STATIC in top-left corner */}
        <div
          className="absolute text-sm opacity-70 z-10"
          style={{
            top: "2px",
            left: "2px",
          }}
        >
          ♜
        </div>

        {/* Bishop moving diagonally in different squares */}
        <div
          className="absolute text-sm opacity-80 transition-all duration-3000 ease-in-out z-10"
          style={{
            animation: "bishopMoveGrid 5s infinite ease-in-out",
          }}
        >
          ♝
        </div>

        {/* Queen STATIC in center */}
        <div
          className="absolute text-base opacity-90 z-10"
          style={{
            top: "32px",
            left: "32px",
          }}
        >
          ♛
        </div>
      </div>
    </div>
  );

  const GeometricLoader = () => (
    <div className="relative w-20 h-20">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 border-4 border-primary rounded-full animate-spin"
          style={{
            animationDuration: `${2 + i}s`,
            animationDirection: i % 2 === 0 ? "normal" : "reverse",
            borderTopColor: "transparent",
            borderRightColor: i === 1 ? "transparent" : undefined,
            transform: `scale(${1 - i * 0.2})`,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
      </div>
    </div>
  );

  const MinimalLoader = () => (
    <div className="flex gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-3 h-12 bg-primary rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1s",
            transform: `scaleY(${0.4 + Math.sin(Date.now() / 200 + i) * 0.6})`,
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "geometric":
        return <GeometricLoader />;
      case "minimal":
        return <MinimalLoader />;
      default:
        return <ChessLoader />;
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-lg z-50 transition-all duration-700",
        show ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
        className
      )}
    >
      <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border shadow-2xl">
        {/* Main loader */}
        {renderLoader()}

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>

        {/* Messages */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-foreground animate-pulse">{message}</h3>
          <p className="text-sm text-muted-foreground">{submessage}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes knightMoveGrid {
          0% {
            top: 16px;
            left: 48px;
          }
          33% {
            top: 48px;
            left: 64px;
          }
          66% {
            top: 64px;
            left: 16px;
          }
          100% {
            top: 16px;
            left: 48px;
          }
        }

        @keyframes bishopMoveGrid {
          0% {
            top: 48px;
            left: 16px;
          }
          50% {
            top: 16px;
            left: 64px;
          }
          100% {
            top: 48px;
            left: 16px;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
