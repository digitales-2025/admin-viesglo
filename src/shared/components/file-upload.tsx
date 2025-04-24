"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { AlertCircleIcon, FileIcon, UploadIcon, XIcon } from "lucide-react";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface FileUploadProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en bytes
  onChange?: (files: FileList | null) => void;
  defaultText?: string;
  icon?: React.ReactNode;
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  onChange,
  className,
  defaultText = "Seleccionar archivo",
  icon = <UploadIcon className="mr-2 h-4 w-4" />,
  ...props
}: FileUploadProps &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setError(null);

    if (files && files.length > 0) {
      // Verificar tamaño del archivo
      let sizeExceeded = false;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          sizeExceeded = true;
          break;
        }
      }

      if (sizeExceeded) {
        setError(`El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`);
        setFileName(null);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      setFileName(multiple ? `${files.length} archivos` : files[0].name);

      if (onChange) {
        onChange(files);
      }
    } else {
      setFileName(null);

      if (onChange) {
        onChange(null);
      }
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={cn("inline-block", className)}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
        aria-label={defaultText}
      />
      <div className="flex flex-col">
        <Button
          onClick={handleClick}
          className={cn("flex items-center", fileName ? "pr-2" : "")}
          type="button"
          {...props}
        >
          {fileName ? (
            <>
              <FileIcon className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[150px]">{fileName}</span>
              <span
                onClick={clearSelection}
                className="ml-2 rounded-full p-1 hover:bg-muted/50 cursor-pointer"
                aria-label="Borrar selección"
              >
                <XIcon className="h-3 w-3" />
              </span>
            </>
          ) : (
            <>
              {icon}
              {defaultText}
            </>
          )}
        </Button>
        {error && (
          <div className="text-destructive text-xs flex items-center mt-1 gap-1">
            <AlertCircleIcon className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
