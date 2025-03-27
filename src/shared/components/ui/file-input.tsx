"use client";

import type React from "react";
import { forwardRef, useRef, useState } from "react";
import { FileText, Image, Upload } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { FormControl } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

interface FileInputProps {
  onChange?: (files: FileList | null) => void;
  className?: string;
  buttonText?: string;
  multiple?: boolean;
  accept?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ onChange, className, buttonText = "Seleccionar archivo", multiple, accept, ...props }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      setFiles(fileList ? Array.from(fileList) : []);

      // Call the provided onChange handler with the FileList
      if (onChange) {
        onChange(fileList);
      }
    };

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <FormControl className={cn("w-full", className)}>
        <div className="flex flex-col gap-2">
          {files.length > 0 && (
            <div className="mt-1">
              <div className="text-sm text-muted-foreground">
                {files.length} {files.length === 1 ? "archivo seleccionado" : "archivos seleccionados"}
              </div>
              <div className="mt-1 max-h-24 max-w-[250px] w-full truncate overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center py-1">
                    {file.type.includes("image") ? (
                      <Image className="h-4 w-4 mr-2 shrink-0 text-emerald-500" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2 shrink-0 text-sky-500" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button type="button" variant="outline" onClick={handleButtonClick} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>

          <Input
            type="file"
            className="hidden"
            ref={(input) => {
              // Handle both refs
              if (typeof ref === "function") {
                ref(input);
              } else if (ref) {
                ref.current = input;
              }
              fileInputRef.current = input;
            }}
            onChange={handleFileChange}
            multiple={multiple}
            accept={accept}
            {...props}
          />
        </div>
      </FormControl>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
