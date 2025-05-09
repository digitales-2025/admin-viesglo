"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { MedicalRecordResponse } from "../../../(admin)/medical-records/_types/medical-record.types";
import RegisterTableActions from "./RegisterTableActions";

interface RegistersRecordProps {
  downloadCertificate: (id: string) => Promise<any>;
  downloadReport: (id: string) => Promise<any>;
  isDownloadingCertificate: boolean;
  isDownloadingReport: boolean;
}

export const registersRecordColumns = ({
  downloadCertificate,
  downloadReport,
  isDownloadingCertificate,
  isDownloadingReport,
}: RegistersRecordProps): ColumnDef<MedicalRecordResponse>[] => {
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
      if (hasAptitudeCertificate(record.files)) {
        await downloadCertificate(record.id);
      } else {
        toast.info(`El certificado de aptitud no está disponible`);
      }
    } catch (_error) {
      // Error silencioso
    }
  };

  // Función para manejar la descarga del informe
  const handleDownloadReport = async (record: MedicalRecordResponse) => {
    try {
      if (hasMedicalReport(record.files)) {
        await downloadReport(record.id);
      } else {
        toast.info(`El informe médico no está disponible`);
      }
    } catch (_error) {
      // Error silencioso
    }
  };

  return [
    {
      id: "cliente",
      accessorKey: "client",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
      cell: ({ row }) => {
        return <div className="font-semibold">{row.original.client?.name || "N/A"}</div>;
      },
    },
    {
      id: "tipo_examen",
      accessorKey: "examType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Examen" />,
      cell: ({ row }) => {
        const examType = row.original.examType;
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
      id: "fecha_registro",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Registro" />,
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <div className="min-w-[150px]">{format(date, "PPP", { locale: es })}</div>;
      },
    },
    {
      id: "nombre",
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => {
        const firstName = row.original.firstName;
        const secondName = row.original.secondName;
        return (
          <div className="font-semibold capitalize min-w-[150px]">
            {firstName} {secondName || ""}
          </div>
        );
      },
    },
    {
      id: "apellidos",
      accessorKey: "firstLastName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Apellidos" />,
      cell: ({ row }) => {
        const firstLastName = row.original.firstLastName;
        const secondLastName = row.original.secondLastName;
        return (
          <div className="font-semibold capitalize min-w-[150px]">
            {firstLastName} {secondLastName || ""}
          </div>
        );
      },
    },
    {
      id: "genero",
      accessorKey: "gender",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Género" />,
      cell: ({ row }) => {
        const gender = row.original.gender;
        let label = "";

        switch (gender) {
          case "MALE":
            label = "Masculino";
            break;
          case "FEMALE":
            label = "Femenino";
            break;
          case "OTHER":
            label = "Otro";
            break;
          default:
            label = gender;
        }

        return <div className="font-semibold capitalize">{label}</div>;
      },
    },
    {
      id: "estado",
      accessorKey: "aptitude",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
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
      id: "aptitud_medica",
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
      id: "informe_medico",
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
        return <RegisterTableActions record={record} />;
      },
    },
  ];
};
