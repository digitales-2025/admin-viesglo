export type CertificateResponse = any;

export type CreateCertificate = any;

export type UpdateCertificate = any;

export type PaginatedCertificatesResponse = any;

export type CertificatesFilters = {
  search?: string;
  from?: Date;
  to?: Date;
};

export enum DocumentType {
  DNI = "DNI",
  PASSPORT = "PASSPORT",
}

export const DocumentTypeLabel = {
  [DocumentType.DNI]: "DNI",
  [DocumentType.PASSPORT]: "Pasaporte",
};
