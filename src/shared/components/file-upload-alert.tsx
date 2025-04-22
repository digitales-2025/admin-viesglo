"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ExternalLink, Upload, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface FileUploadAlertProps {
  file: File;
  onClose: () => void;
  description?: string;
  user?: string;
  progress: number;
  isUploading: boolean;
  error?: string | null;
}

export function FileUploadAlert({
  file,
  onClose,
  description = "",
  user = "yo",
  progress,
  isUploading,
  error,
}: FileUploadAlertProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-opacity duration-300 shadow-lg",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <Card className="w-[400px] bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {error ? (
              <X className="h-5 w-5 text-red-500" />
            ) : isUploading && progress < 100 ? (
              <Upload className="h-5 w-5 text-blue-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <span className="font-medium">
              {error
                ? "Error al subir archivo"
                : isUploading && progress < 100
                  ? "Subiendo 1 archivo..."
                  : "Se cargó 1 archivo"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsExpanded(!isExpanded)}>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded ? "" : "-rotate-180")} />
              <span className="sr-only">Expandir</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
              <span className="text-sm font-normal">Cerrar</span>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2">
            <div className="flex items-start gap-3 mb-2">
              <div className="h-12 w-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-700 text-white text-xs">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="truncate font-medium">{file.name}</div>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-2" onClick={handleClose}>
                    <X className="h-3 w-3" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {user} • {description || "[Ejemplo] Reunión de lanzamiento..."}
                </div>
                <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Abrir</span>
              </Button>
            </div>
            <div className="h-1 w-full bg-gray-200 rounded-full mt-2">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  error ? "bg-red-500" : progress < 100 ? "bg-blue-500" : "bg-green-500"
                )}
                style={{ width: `${error ? 100 : progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
