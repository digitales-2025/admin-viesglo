import { CertificateResponse } from "../_types/certificates.types";

interface CertificatesTableOptionsProps {
  certificate?: CertificateResponse;
}

export default function CertificatesTableOptions({ certificate }: CertificatesTableOptionsProps) {
  console.log(certificate);
  //const MODULE = "certificates";

  return <></>;
}
