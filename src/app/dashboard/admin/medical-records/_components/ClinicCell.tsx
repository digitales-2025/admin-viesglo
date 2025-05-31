"use client";

import { useEffect, useState } from "react";

import { useClinic } from "../../clinics/_hooks/useClinics";
import { ClinicResponse } from "../../clinics/_types/clinics.types";

interface ClinicCellProps {
  clinicId: string | undefined;
  clinicsList?: ClinicResponse[];
}

export default function ClinicCell({ clinicId, clinicsList = [] }: ClinicCellProps) {
  const [clinicName, setClinicName] = useState<string>("Cargando...");

  // First check if we can find the clinic in the list
  useEffect(() => {
    if (clinicsList.length > 0 && clinicId) {
      const foundClinic = clinicsList.find((c) => c.id === clinicId);
      if (foundClinic) {
        setClinicName(foundClinic.name);
      }
    }
  }, [clinicId, clinicsList]);

  // If we can't find in list, try to fetch it
  const { data: clinic, isLoading, error } = useClinic(clinicId);

  useEffect(() => {
    if (clinic) {
      setClinicName(clinic.name);
    } else if (error) {
      setClinicName("Clínica no encontrada");
    } else if (!isLoading && !clinicId) {
      setClinicName("Clínica no asignada");
    }
  }, [clinic, error, isLoading, clinicId]);

  return <div className="capitalize min-w-[150px]">{clinicName}</div>;
}
