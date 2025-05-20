"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Calendar, File, Image as ImageIcon } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Pdf } from "@/shared/components/icons/Files";
import { Badge } from "@/shared/components/ui/badge";
import CopyButton from "@/shared/components/ui/button-copy";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { CertificateResponse, DocumentTypeLabel } from "../_types/certificates.types";
import CertificatesTableActions from "./CertificatesTableActions";

export const columnsCertificates = (): ColumnDef<CertificateResponse>[] => [
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[50px] max-w-[150px]">{row.original.ruc}</div>,
  },
  {
    id: "razón social",
    accessorKey: "businessName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[200px] max-w-[200px] truncate" title={row.original.businessName}>
        {row.original.businessName}
      </div>
    ),
  },
  {
    id: "código",
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize min-w-[150px] max-w-[150px]">
        {row.original.code ? (
          <CopyButton variant="outline" size="sm" content={row.original.code} label={row.original.code} />
        ) : (
          <Badge variant="outline" className="text-slate-600 font-normal capitalize">
            No tiene código
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "documento",
    accessorKey: "documentNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Documento" />,
    cell: ({ row }) => (
      <span className="text-slate-600 font-normal capitalize inline-flex gap-2 items-center">
        {row.original.documentNumber && (
          <CopyButton
            variant="outline"
            size="sm"
            content={row.original.documentNumber}
            label={row.original.documentNumber}
          />
        )}
        <span className="text-xs font-normal capitalize">
          {DocumentTypeLabel[row.original.documentType as keyof typeof DocumentTypeLabel]}
        </span>
      </span>
    ),
  },
  {
    id: "nombre del participante",
    accessorKey: "nameUser",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del participante" />,
    cell: ({ row }) => (
      <div className="capitalize min-w-[150px] max-w-[150px]">
        {row.original.nameUser} {row.original.lastNameUser}
      </div>
    ),
  },

  {
    id: "tema de la capacitación",
    accessorKey: "nameCapacitation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tema de la capacitación" />,
    cell: ({ row }) => (
      <div
        className="font-semibold truncate capitalize min-w-[150px] max-w-[150px]"
        title={row.original.nameCapacitation}
      >
        {row.original.nameCapacitation}
      </div>
    ),
  },
  {
    id: "fecha de emisión",
    accessorKey: "dateEmision",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de emisión" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-slate-600">
        <Calendar className="w-4 h-4" />
        {typeof row.original.dateEmision === "string"
          ? row.original.dateEmision.substring(0, 10).split("-").reverse().join("/")
          : "Fecha inválida"}
      </Badge>
    ),
  },
  {
    id: "fecha de caducidad",
    accessorKey: "dateExpiration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de caducidad" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="text-slate-600">
        <Calendar className="w-4 h-4" />
        {typeof row.original.dateExpiration === "string"
          ? row.original.dateExpiration.substring(0, 10).split("-").reverse().join("/")
          : "Fecha inválida"}
      </Badge>
    ),
  },
  {
    id: "certificado",
    accessorKey: "fileCertificate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Certificado" />,
    cell: function Cell({ row }) {
      const { open } = useDialogStore();
      return (
        <div
          className="min-w-[150px] max-w-[150px] cursor-pointer"
          role="button"
          onClick={() => {
            open("certificates", "view", row.original);
          }}
        >
          {row.original.fileCertificate ? (
            <Badge variant="outline" className="text-slate-600 font-normal capitalize">
              {row.original.fileCertificate.fileType === "PDF" && <Pdf className="w-4 h-4 text-rose-400" />}
              {row.original.fileCertificate.fileType === "IMAGE" && <ImageIcon className="w-4 h-4 text-emerald-400" />}
              {row.original.fileCertificate.fileType === "DOCUMENT" && <File className="w-4 h-4 text-sky-400" />}
              {row.original.fileCertificate.originalName}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-600 font-normal capitalize">
              No tiene certificado
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <div className="min-w-[150px] max-w-[150px]">
        {row.original.isActive ? <Badge variant="success">Activo</Badge> : <Badge variant="error">Inactivo</Badge>}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CertificatesTableActions certificate={row.original} />,
  },
];
