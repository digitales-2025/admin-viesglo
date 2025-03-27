"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Check, Copy } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface CopyButtonProps {
  content: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

export default function CopyButton({
  content,
  className,
  variant = "default",
  size = "default",
  label = "Copiar",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar el texto:", error);
    }
  };

  const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden cursor-pointer shadow-none h-6 text-xs",
    {
      variants: {
        variant: {
          default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
          secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
          destructive:
            "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
          ghost:
            "border-transparent bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
          link: "border-transparent bg-transparent text-foreground [a&]:hover:bg-transparent [a&]:hover:text-accent-foreground",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  );

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn(badgeVariants({ variant }), className)}
      aria-label={isCopied ? "Copiado" : "Copiar al portapapeles"}
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4 mr-2 text-emerald-500" />
          Copiado
        </>
      ) : (
        <span className="flex items-center gap-1 truncate">
          <Copy className="size-3  mr-2 text-slate-500" strokeWidth={1} />
          {label}
        </span>
      )}
    </Button>
  );
}
