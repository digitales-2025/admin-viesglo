"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, ShieldAlert, ShieldBan, ShieldCheck } from "lucide-react";

import { CustomFilterGroup, CustomFilterOption } from "@/shared/components/data-table/custom-types";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { Input } from "@/shared/components/ui/input";
import { debounce } from "@/shared/lib/utils";
import {
  useAvailableDiagnostics,
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../_hooks/useMedicalRecords";
import { MedicalRecordResponse, MedicalRecordsFilter } from "../_types/medical-record.types";
import { useClinics } from "../../clinics/_hooks/useClinics";
import { columnsMedicalRecord } from "./medical-record.column";

export default function MedicalRecordTable() {
  const [filters, setFilters] = useState<MedicalRecordsFilter>({
    page: 1,
    limit: 10,
  });

  const router = useRouter();

  const handleRowClick = (row: MedicalRecordResponse) => {
    router.push(`/medical-records/${row.id}/details`);
  };

  const {
    data: medicalRecordsData,
    paginationMeta,
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useMedicalRecords(filters);

  const medicalRecords = medicalRecordsData || [];

  const { data: clinics, isLoading: isLoadingClinics, error: clinicsError } = useClinics();

  const { data: availableDiagnostics, isLoading: isLoadingDiagnostics } = useAvailableDiagnostics();

  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  const [freeTextDiagnosticName, setFreeTextDiagnosticName] = useState<string>("");

  const debouncedDiagnosticNameSearch = useMemo(() => {
    return debounce((searchTerm: string) => {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        diagnosticName: searchTerm.trim() ? [searchTerm.trim()] : undefined,
      }));
    }, 450);
  }, []);

  const handleFreeTextDiagnosticChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = event.target.value;
      setFreeTextDiagnosticName(searchTerm);
      debouncedDiagnosticNameSearch(searchTerm);
    },
    [debouncedDiagnosticNameSearch]
  );

  // Estado inicial para los filtros base que siempre estarán disponibles
  const baseFilterOptions = useMemo(
    () => [
      {
        label: "Aptitud",
        value: "aptitude",
        multiSelect: false,
        options: [
          { label: "Apto", value: "APT", icon: ShieldCheck },
          { label: "Apto con restricciones", value: "APT_WITH_RESTRICTIONS", icon: ShieldAlert },
          { label: "No apto", value: "NOT_APT", icon: ShieldBan },
        ],
      },
    ],
    []
  );

  const medicalRecordFilterOptions: CustomFilterGroup[] = useMemo(() => {
    // Empezamos con las opciones base
    const options: CustomFilterGroup[] = [...baseFilterOptions];

    if (clinics && clinics.length > 0) {
      options.push({
        label: "Clínica",
        value: "clinicId",
        multiSelect: false,
        options: clinics.map(
          (clinic): CustomFilterOption => ({
            label: clinic.name,
            value: String(clinic.id),
          })
        ),
      });
    }
    if (availableDiagnostics && availableDiagnostics.length > 0) {
      options.push({
        label: "Diagnóstico",
        value: "diagnosticName",
        multiSelect: true,
        options: availableDiagnostics.map(
          (diag): CustomFilterOption => ({
            label: diag.name,
            value: diag.name,
          })
        ),
      });
    }
    return options;
  }, [clinics, availableDiagnostics, baseFilterOptions]);

  const columns = useMemo(
    () =>
      columnsMedicalRecord({
        clinics: clinics || [],
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [clinics, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  const debouncedSearch = useMemo(() => {
    return debounce((searchTerm: string) => {
      setFilters((prev) => ({ ...prev, page: 1, search: searchTerm || undefined }));
    }, 400);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, page: 1, limit }));
  }, []);

  const handleSearchChange = useCallback(
    (search: string) => {
      debouncedSearch(search);
    },
    [debouncedSearch]
  );

  const handleFilterChange = useCallback((columnId: string, value: string | string[] | null) => {
    setFilters((prev) => {
      const newFilters: MedicalRecordsFilter = { ...prev };
      const key = columnId as keyof MedicalRecordsFilter;

      if (value === null || (Array.isArray(value) && value.length === 0)) {
        delete newFilters[key];
        if (key === "diagnosticName") {
          setFreeTextDiagnosticName("");
        }
      } else {
        if (key === "diagnosticName") {
          if (Array.isArray(value)) {
            newFilters.diagnosticName = value;
            setFreeTextDiagnosticName("");
          } else {
            newFilters.diagnosticName = [value];
          }
        } else if (key === "clinicId") {
          newFilters.clinicId = Array.isArray(value) ? value[0] : value;
        } else if (key === "aptitude") {
          // Manejar el filtro de aptitud
          newFilters.aptitude = Array.isArray(value) ? value[0] : value;
        }
      }
      return { ...newFilters, page: 1 };
    });
  }, []);

  const serverPagination = useMemo(
    () =>
      paginationMeta
        ? {
            currentPage: paginationMeta.currentPage,
            totalPages: paginationMeta.totalPages,
            pageSize: paginationMeta.itemsPerPage,
            totalItems: paginationMeta.totalItems,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }
        : undefined,
    [paginationMeta, handlePageChange, handlePageSizeChange]
  );

  const serverFilters = useMemo(
    () => ({
      filters,
      onSearchChange: handleSearchChange,
      onFilterChange: handleFilterChange,
    }),
    [filters, handleSearchChange, handleFilterChange]
  );

  const tableActions = useMemo(
    () => (
      <div className="flex items-center gap-x-2 flex-wrap">
        <DatePickerWithRange
          size="sm"
          onConfirm={(value) => {
            setFilters((prev) => ({
              ...prev,
              page: 1,
              from: value?.from,
              to: value?.to,
            }));
          }}
          onClear={() => {
            setFilters((prev) => ({
              ...prev,
              page: 1,
              from: undefined,
              to: undefined,
            }));
          }}
        />
        <Input
          placeholder="Buscar diagnóstico..."
          value={freeTextDiagnosticName}
          onChange={handleFreeTextDiagnosticChange}
          className="h-8 w-[120px] lg:w-[180px]"
        />
        <Button variant="outline" size="sm" className="h-8 lg:flex">
          <FileDown className="mr-2 h-4 w-4" /> Descargar
        </Button>
      </div>
    ),
    [freeTextDiagnosticName, handleFreeTextDiagnosticChange]
  );

  if (recordsError) {
    console.error("Error al cargar registros médicos:", recordsError);
    return <div className="text-center py-4">Error al cargar registros médicos</div>;
  }

  if (clinicsError) {
    console.warn("Error al cargar clínicas (no bloqueante):", clinicsError);
  }

  return (
    <DataTable
      columns={columns}
      data={medicalRecords}
      isLoading={isLoadingRecords}
      actions={tableActions}
      mode="server"
      serverPagination={serverPagination}
      serverFilters={serverFilters}
      serverFilterOptions={medicalRecordFilterOptions as any}
      serverFilterLoading={isLoadingClinics || isLoadingDiagnostics}
      onClickRow={handleRowClick}
    />
  );
}
