"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileDown } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { MedicalRecordResponse } from "../_types/medical-record.types";
import { ClinicResponse } from "../../clinics/_types/clinics.types";
import ClinicCell from "./ClinicCell";
import MedicalRecordTableActions from "./MedicalRecordTableActions";

interface ColumnsMedicalRecordProps {
  clinics?: ClinicResponse[];
  downloadCertificate: (id: string) => Promise<any>;
  downloadReport: (id: string) => Promise<any>;
  isDownloadingCertificate: boolean;
  isDownloadingReport: boolean;
}

export const columnsMedicalRecord = ({
  clinics = [],
  downloadCertificate,
  downloadReport,
  isDownloadingCertificate,
  isDownloadingReport,
}: ColumnsMedicalRecordProps): ColumnDef<MedicalRecordResponse>[] => {
  // Función para verificar si existe un informe médico
  const hasMedicalReport = (files: any[] | undefined) => {
    if (!files || files.length === 0) return false;
    return files.some(
      (file) =>
        file.descriptiveName?.toLowerCase().includes("informe") || file.originalName?.toLowerCase().includes("informe")
    );
  };

  // Función para verificar si existe un certificado de aptitud
  const hasAptitudeCertificate = (files: any[] | undefined) => {
    if (!files || files.length === 0) return false;
    return files.some(
      (file) =>
        file.descriptiveName?.toLowerCase().includes("certificado") ||
        file.originalName?.toLowerCase().includes("certificado")
    );
  };

  // Función para manejar la descarga del certificado
  const handleDownloadCertificate = async (record: MedicalRecordResponse) => {
    try {
      // const hasCertificate = hasAptitudeCertificate(record.files);
      // // if (!hasCertificate) {
      // //   toast.error("No hay documento disponible");
      // //   return;
      // // }

      // La función de descarga ahora maneja internamente los toasts y la descarga
      await downloadCertificate(record.id);
    } catch (error) {
      console.warn("Error inesperado al descargar certificado", error);
    }
  };

  // Función para manejar la descarga del informe
  const handleDownloadReport = async (record: MedicalRecordResponse) => {
    try {
      // La función de descarga ahora maneja internamente los toasts y la descarga
      await downloadReport(record.id);
    } catch (error) {
      console.warn("Error inesperado al descargar informe", error);
    }
  };

  return [
    {
      id: "clinica",
      accessorKey: "clinicId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Clínica" />,
      cell: ({ row }) => {
        const clinicId = row.original.clinicId;
        return <ClinicCell clinicId={clinicId} clinicsList={clinics} />;
      },
    },
    {
      id: "tipo de examen",
      accessorKey: "examType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Examen" />,
      cell: ({ row }) => {
        const examType = row.getValue("tipo de examen") as string;
        let label = "";

        switch (examType) {
          case "PRE_OCCUPATIONAL":
            label = "Pre-ocupacional";
            break;
          case "PERIODIC":
            label = "Periódico";
            break;
          case "RETIREMENT":
            label = "Retiro";
            break;
          case "OTHER":
            label = "Otro";
            break;
          default:
            label = examType;
        }

        return <div className="font-semibold capitalize min-w-[150px]">{label}</div>;
      },
    },
    {
      id: "fecha de registro",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Registro" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("fecha de registro"));
        return <div className="min-w-[150px]">{format(date, "PPP", { locale: es })}</div>;
      },
    },
    {
      id: "nombre",
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("nombre")}</div>,
    },
    {
      id: "apellido paterno",
      accessorKey: "firstLastName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido Paterno" />,
      cell: ({ row }) => (
        <div className="font-semibold capitalize min-w-[150px]">{row.getValue("apellido paterno")}</div>
      ),
    },
    {
      id: "estado",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        // Ahora usamos el valor de aptitude directamente del registro médico
        const aptitude = row.original.aptitude;

        let status = "";
        let variant: "success" | "error" | "outline" | "info" = "outline";

        switch (aptitude) {
          case "APT":
            status = "Apto";
            variant = "success";
            break;
          case "APT_WITH_RESTRICTIONS":
            status = "Apto con restricciones";
            variant = "info";
            break;
          case "NOT_APT":
            status = "No apto";
            variant = "error";
            break;
          default:
            status = "Desconocido";
            variant = "outline";
        }

        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      id: "aptitud médica",
      accessorKey: "aptitude",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Aptitud Médica" />,
      cell: ({ row }) => {
        const hasCertificate = hasAptitudeCertificate(row.original.files);

        return (
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleDownloadCertificate(row.original)}
              style={{ opacity: hasCertificate && !isDownloadingCertificate ? 1 : 0.5 }}
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span className="underline">Certificado de aptitud</span>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "informe médico",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Informe Médico" />,
      cell: ({ row }) => {
        const files = row.original.files;
        const hasReport = hasMedicalReport(files);

        return (
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => handleDownloadReport(row.original)}
              style={{ opacity: hasReport && !isDownloadingReport ? 1 : 0.5 }}
            >
              <FileDown className="h-4 w-4 mr-2" />
              <span className="underline">Informe médico</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "opciones",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opciones" />,
      cell: ({ row }) => {
        const record = row.original;
        return <MedicalRecordTableActions record={record} />;
      },
    },
  ];
};
