"use client";

import confetti from "canvas-confetti";

import { Button } from "@/shared/components/ui/button";

interface ConfettiSideCannonsProps {
  onTrigger?: () => void; // Callback opcional cuando se dispara el confetti
  buttonText?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean; // Para usar como contenido de otro botón
}

export function ConfettiSideCannons({
  onTrigger,
  buttonText = "¡Celebrar!",
  className,
  variant = "default",
  size = "default",
  asChild = false,
}: ConfettiSideCannonsProps) {
  const handleClick = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();

    // Ejecutar callback si se proporciona
    if (onTrigger) {
      onTrigger();
    }
  };

  if (asChild) {
    // Cuando se usa como contenido de otro botón, solo retornar el texto y el efecto
    return (
      <span onClick={handleClick} className={className}>
        {buttonText}
      </span>
    );
  }

  return (
    <div className="relative">
      <Button onClick={handleClick} variant={variant} size={size} className={className}>
        {buttonText}
      </Button>
    </div>
  );
}
