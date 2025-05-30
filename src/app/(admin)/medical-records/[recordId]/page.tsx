"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function AdminMedicalRecordPage() {
  const router = useRouter();
  const { recordId } = useParams();
  const pathname = usePathname();

  useEffect(() => {
    // Solo redirigir si estamos exactamente en /medical-records/[id]
    // y no en una subruta como /medical-records/[id]/edit
    if (pathname === `/medical-records/${recordId}`) {
      router.push(`/medical-records/${recordId}/details`);
    }
  }, [router, recordId, pathname]);

  return null;
}
