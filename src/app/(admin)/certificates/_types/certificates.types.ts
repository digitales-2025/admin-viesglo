import { components } from "@/lib/api/types/api";

export type CertificateResponse = components["schemas"]["CertificateResponseDto"];

export type CreateCertificate = components["schemas"]["CreateCertificateDto"];

export type UpdateCertificate = components["schemas"]["UpdateCertificateDto"];

export type PaginatedCertificatesResponse = Omit<components["schemas"]["PaginatedCertificateResponseDto"], "data"> & {
  data: CertificateResponse[];
};

export type CertificatesFilters = {
  search?: string;
  from?: Date;
  to?: Date;
};
