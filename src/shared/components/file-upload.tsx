"use client";

import type React from "react";
import { useState } from "react";
import { Check, File, Upload, X } from "lucide-react";

import { FileUploadAlert } from "@/shared/components/file-upload-alert";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";

export interface FileUploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
  isSuccess: boolean;
}

export interface FileUploadProps {
  // Función que recibe el archivo y devuelve un objeto con el estado de la carga
  uploadFile?: (file: File) => {
    status: FileUploadStatus;
    upload: () => Promise<void>;
    cancel: () => void;
  };
  accept?: string;
  maxSize?: number; // in bytes
  showAlert?: boolean;
  onFileSelect?: (file: File | null) => void;
}

export function FileUpload({
  uploadFile,
  accept = "*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  showAlert = true,
  onFileSelect,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>({
    isUploading: false,
    progress: 0,
    error: null,
    isSuccess: false,
  });
  const [showUploadAlert, setShowUploadAlert] = useState(false);
  const [uploadController, setUploadController] = useState<{
    upload: () => Promise<void>;
    cancel: () => void;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      setUploadStatus({
        ...uploadStatus,
        error: `El archivo excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    setFile(selectedFile);

    // Notify parent component if callback provided
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }

    // Reset status
    setUploadStatus({
      isUploading: false,
      progress: 0,
      error: null,
      isSuccess: false,
    });

    if (uploadFile) {
      // Get upload controller from the provided function
      const controller = uploadFile(selectedFile);
      setUploadController(controller);
      setUploadStatus(controller.status);

      if (showAlert) {
        setShowUploadAlert(true);
      }

      // Start upload
      try {
        await controller.upload();
      } catch (error) {
        console.error("Error al subir el archivo", error);
        // Error handling is managed by the external upload function
        // through the status object
      }
    }
  };

  const handleRemoveFile = () => {
    // Cancel upload if in progress
    if (uploadController && uploadStatus.isUploading) {
      uploadController.cancel();
    }

    setFile(null);
    setUploadStatus({
      isUploading: false,
      progress: 0,
      error: null,
      isSuccess: false,
    });
    setShowUploadAlert(false);

    // Notify parent component if callback provided
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const handleCloseAlert = () => {
    setShowUploadAlert(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-1 min-w-[150px] max-w-[250px]">
        {!file ? (
          <div className="flex items-center gap-1">
            <input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} accept={accept} />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="ghost" size="sm" className="h-8 px-2" type="button" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Subir
                </span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs truncate max-w-[180px]">
                <File className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleRemoveFile}>
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar archivo</span>
              </Button>
            </div>

            {uploadStatus.isUploading && <Progress value={uploadStatus.progress} className="h-1 w-full" />}

            {uploadStatus.isSuccess && (
              <div className="flex items-center text-xs text-green-600">
                <Check className="h-3 w-3 mr-1" />
                <span>Subido</span>
              </div>
            )}

            {uploadStatus.error && <div className="text-xs text-red-500">{uploadStatus.error}</div>}
          </div>
        )}
      </div>

      {showUploadAlert && file && (
        <FileUploadAlert
          file={file}
          onClose={handleCloseAlert}
          progress={uploadStatus.progress}
          isUploading={uploadStatus.isUploading}
          error={uploadStatus.error}
        />
      )}
    </>
  );
}
