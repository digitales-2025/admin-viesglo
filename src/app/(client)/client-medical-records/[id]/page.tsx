"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function MedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = params.id;

  useEffect(() => {
    // Solo redirigir si estamos exactamente en /medical-records/[id]
    // y no en una subruta como /medical-records/[id]/edit
    if (pathname === `/medical-records/${id}`) {
      router.push(`/medical-records/${id}/details`);
    }
  }, [router, id, pathname]);

  return null;
}
