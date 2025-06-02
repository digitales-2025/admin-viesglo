"use client";

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function ClientMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = params.id;

  useEffect(() => {
    // Solo redirigir si estamos exactamente en /medical-records/[id]
    // y no en una subruta como /medical-records/[id]/edit
    if (pathname === `/dashboard/client/medical-records/${id}`) {
      router.push(`/dashboard/client/medical-records/${id}/details`);
    }
  }, [router, id, pathname]);

  return null;
}
