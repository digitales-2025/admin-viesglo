"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Info, Loader2, Search, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { CreateClientFormData } from "../../_hooks/use-client-form";
import { useSunatInfoByRuc } from "../../_hooks/use-clients";

interface LookupRucProps {
  form: UseFormReturn<CreateClientFormData>;
}

export default function LookupRuc({ form }: LookupRucProps) {
  const [rucInput, setRucInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedRuc, setLastSearchedRuc] = useState("");
  const [rucToSearch, setRucToSearch] = useState("");

  const {
    data: sunatData,
    isFetching: isLoadingSunat,
    error: errorSunat,
    isSuccess: isSuccessSunat,
  } = useSunatInfoByRuc(rucToSearch, !!rucToSearch && rucToSearch.length === 11);

  console.log("LookupRuc - sunatData:", JSON.stringify(sunatData, null, 2));

  // Validar si el RUC es válido (11 dígitos)
  const isRucValid = rucInput.length === 11 && /^\d{11}$/.test(rucInput);

  // Determinar si el botón debe estar deshabilitado
  const isButtonDisabled = isLoadingSunat || rucInput === lastSearchedRuc || !isRucValid;

  // Manejar la búsqueda del RUC
  const handleRucSearch = async () => {
    if (isButtonDisabled) return;
    setHasSearched(true);
    setLastSearchedRuc(rucInput);
    setRucToSearch(rucInput);
  };

  // Auto-llenar el formulario cuando se encuentren datos
  useEffect(() => {
    if (isSuccessSunat && sunatData) {
      console.log("LookupRuc - Llenando formulario con datos SUNAT");

      // Llenar datos básicos
      form.setValue("name", sunatData.sunatInfo?.businessName || "");
      form.setValue("legalRepresentative", sunatData.legalRepresentative || "");

      // Llenar información SUNAT
      form.setValue("sunatInfo.address", sunatData.sunatInfo?.address || "");
      form.setValue("sunatInfo.fullAddress", sunatData.sunatInfo?.fullAddress || "");
      form.setValue("sunatInfo.businessName", sunatData.sunatInfo?.businessName || "");
      form.setValue("sunatInfo.state", sunatData.sunatInfo?.state || "");
      form.setValue("sunatInfo.condition", sunatData.sunatInfo?.condition || "");

      // Llenar ubicación geográfica
      const department = sunatData.sunatInfo?.department || "";
      const province = sunatData.sunatInfo?.province || "";
      const district = sunatData.sunatInfo?.district || "";

      console.log("LookupRuc - Asignando ubicación:", { department, province, district });

      form.setValue("sunatInfo.department", department);
      form.setValue("sunatInfo.province", province);
      form.setValue("sunatInfo.district", district);

      // Verificar que se asignaron correctamente
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log("LookupRuc - Valores actuales del formulario:", {
          department: currentValues.sunatInfo?.department,
          province: currentValues.sunatInfo?.province,
          district: currentValues.sunatInfo?.district,
        });
      }, 100);
    }
  }, [isSuccessSunat, sunatData, form]);

  // Manejar el cambio en el input del RUC
  const handleRucChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 11);
    setRucInput(numericValue);
    form.setValue("ruc", numericValue);
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
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>

        {/* Status simple */}
        {rucInput.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isRucValid ? (
                <span className="text-primary font-medium">
                  ✓ RUC válido. Verifique y haga clic en "Buscar" para consultar
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
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
          <div className="p-1.5 rounded-md bg-primary/10">
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">✅ Datos encontrados y asignados</div>
            <div className="text-foreground font-semibold">{sunatData.sunatInfo?.businessName}</div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              📍 {sunatData.sunatInfo?.department} - {sunatData.sunatInfo?.province} - {sunatData.sunatInfo?.district}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Estado: {sunatData.sunatInfo?.state} | Condición: {sunatData.sunatInfo?.condition}
            </div>
          </div>
          <User className="h-5 w-5 text-primary/60 shrink-0" />
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
              {errorSunat instanceof Error
                ? errorSunat.message
                : typeof errorSunat === "object" && errorSunat !== null && "message" in errorSunat
                  ? String((errorSunat as any).message)
                  : "No se pudo obtener los datos del RUC. Verifique el número e intente nuevamente."}
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
