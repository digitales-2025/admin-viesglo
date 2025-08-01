"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Info, Loader2, Search, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useSunatInfoByRuc } from "../../_hooks/use-clients";
import { CreateClientFormData } from "../../_schemas/clients.schemas";

interface LookupRucProps {
  form: UseFormReturn<CreateClientFormData>;
  isUpdate?: boolean;
}

export default function LookupRuc({ form, isUpdate = false }: LookupRucProps) {
  const [rucInput, setRucInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedRuc, setLastSearchedRuc] = useState<string | undefined>(undefined);

  // ARREGLADO: Solo hacer la consulta si el usuario ha buscado manualmente
  const shouldQuery = hasSearched && !!lastSearchedRuc && lastSearchedRuc.length === 11;

  const {
    data: sunatData,
    isFetching: isLoadingSunat,
    error: errorSunat,
    isSuccess: isSuccessSunat,
  } = useSunatInfoByRuc(lastSearchedRuc ?? "", shouldQuery);

  // Sincronizar el input con el valor del formulario (para modo actualizar)
  useEffect(() => {
    const formRuc = form.getValues("ruc");
    if (formRuc && formRuc !== rucInput) {
      setRucInput(formRuc);
    }
  }, [form.watch("ruc")]);

  // Limpiar estado cuando se cierra/abre el modal
  useEffect(() => {
    if (!isUpdate) {
      setRucInput("");
      setHasSearched(false);
      setLastSearchedRuc("");
    }
  }, [isUpdate]);

  // Validar si el RUC es válido (11 dígitos)
  const isRucValid = rucInput.length === 11 && /^\d{11}$/.test(rucInput);

  // Determinar si el botón debe estar deshabilitado
  const isButtonDisabled = isLoadingSunat || rucInput === lastSearchedRuc || !isRucValid;

  // Manejar la búsqueda del RUC
  const handleRucSearch = async () => {
    if (isButtonDisabled) return;
    setHasSearched(true);
    setLastSearchedRuc(rucInput);
  };

  // Auto-llenar el formulario cuando se encuentren datos (solo en modo crear)
  useEffect(() => {
    if (isSuccessSunat && sunatData) {
      // Llenar datos básicos
      form.setValue("name", sunatData.sunatInfo?.businessName || "");
      form.setValue("legalRepresentative", sunatData.legalRepresentative || "");

      // Llenar información SUNAT
      form.setValue("sunatInfo.address", sunatData.sunatInfo?.address || "");
      form.setValue("sunatInfo.fullAddress", sunatData.sunatInfo?.fullAddress || "");
      form.setValue("sunatInfo.businessName", sunatData.sunatInfo?.businessName || "");
      form.setValue("sunatInfo.state", sunatData.sunatInfo?.state || "");
      form.setValue("sunatInfo.condition", sunatData.sunatInfo?.condition || "");

      // Llenar ubicación geográfica con delay para sincronización
      setTimeout(() => {
        const department = sunatData.sunatInfo?.department || "";
        const province = sunatData.sunatInfo?.province || "";
        const district = sunatData.sunatInfo?.district || "";

        form.setValue("sunatInfo.department", department, { shouldValidate: true });
        form.setValue("sunatInfo.province", province, { shouldValidate: true });
        form.setValue("sunatInfo.district", district, { shouldValidate: true });

        // Forzar trigger para notificar a los watchers
        form.trigger(["sunatInfo.department", "sunatInfo.province", "sunatInfo.district"]);
      }, 200);
    }
  }, [isUpdate, isSuccessSunat, sunatData, form]);

  // Manejar el cambio en el input del RUC
  const handleRucChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 11);
    setRucInput(numericValue);
    form.setValue("ruc", numericValue);

    // Resetear estado de búsqueda si cambia el RUC
    if (numericValue !== lastSearchedRuc) {
      setHasSearched(false);
    }
  };

  // Manejar Enter para buscar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isButtonDisabled) {
      e.preventDefault();
      handleRucSearch();
    }
  };

  const hasError = (): boolean => {
    return Boolean(errorSunat);
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative group">
            <Input
              placeholder="Ingrese RUC (11 dígitos)"
              value={rucInput}
              onChange={(e) => handleRucChange(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={11}
              className={`
                tracking-wider transition-all duration-200
                ${isRucValid ? "border-primary/60 bg-primary/5" : ""}
                ${hasSearched && errorSunat ? "border-destructive/60 bg-destructive/5" : ""}
              `}
            />

            {/* Indicador de progreso sutil */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(rucInput.length / 11) * 100}%` }}
              />
            </div>

            {/* Icono de estado */}
            {rucInput.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isRucValid ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleRucSearch}
            disabled={isButtonDisabled}
            variant={!isButtonDisabled ? "default" : "outline"}
            size="default"
            className="px-4"
          >
            {isLoadingSunat ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="sm:block hidden">{isUpdate ? "Consultar" : "Buscar"}</span>
              </>
            )}
          </Button>
        </div>

        {/* Status */}
        {rucInput.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isRucValid ? (
                <span className="text-primary font-medium">
                  RUC válido. Haga clic en "{isUpdate ? "Consultar" : "Buscar"}" para obtener datos
                </span>
              ) : (
                <span className="text-muted-foreground">{rucInput.length}/11 dígitos</span>
              )}
            </div>

            {rucInput === lastSearchedRuc && hasSearched && (
              <Badge variant="secondary" className="text-xs">
                Consultado
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingSunat && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div className="text-sm">
            <span className="font-medium">Consultando SUNAT...</span>
            <span className="text-muted-foreground ml-2">RUC {rucInput}</span>
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccessSunat && sunatData && hasSearched && (
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border bg-primary/5 border-primary/20 shadow-sm">
          {/* Columna izquierda: icono grande y badge */}
          <div className="flex flex-col items-center justify-center gap-2 min-w-[80px]">
            <div className="rounded-full bg-primary/10 p-2 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="success" className="text-xs px-2 py-0.5 mt-1">
              Consulta exitosa
            </Badge>
          </div>
          {/* Columna derecha: información */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Nombre y representante */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary/70 shrink-0" />
                <span className="font-semibold text-base">{sunatData.sunatInfo?.businessName}</span>
              </div>
              {sunatData.legalRepresentative && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3 shrink-0" />
                  <span>
                    Representante legal: <span className="font-medium">{sunatData.legalRepresentative}</span>
                  </span>
                </div>
              )}
            </div>
            {/* Ubicación */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>
                {sunatData.sunatInfo?.department} - {sunatData.sunatInfo?.province} - {sunatData.sunatInfo?.district}
              </span>
            </div>
            {/* Estado y condición */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="px-1.5 py-0.5 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Estado: {sunatData.sunatInfo?.state}
              </Badge>
              <Badge variant="outline" className="px-1.5 py-0.5 flex items-center gap-1">
                <Info className="h-3 w-3 text-blue-600" />
                Condición: {sunatData.sunatInfo?.condition}
              </Badge>
            </div>
          </div>
        </div>
      )}
      {/* Error State */}
      {hasSearched && hasError() && (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5 border-destructive/20">
          <div className="p-1.5 rounded-md bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm text-destructive">Error en la consulta</div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {/* Mostrar primero el userMessage si existe, si no el message */}
              {errorSunat?.error?.userMessage ? (
                <div className="mb-1">{errorSunat.error.userMessage}</div>
              ) : errorSunat?.error?.message ? (
                <div className="mb-1">{errorSunat.error.message}</div>
              ) : errorSunat instanceof Error ? (
                <div className="mb-1">{errorSunat.message}</div>
              ) : (
                <div>No se pudo obtener los datos del RUC. Verifique el número e intente nuevamente.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!hasSearched && rucInput.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-muted">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Los datos se completarán automáticamente una vez encontrados
          </span>
        </div>
      )}
    </div>
  );
}
