import { FilterX } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { useCertificateFilterStore } from "../_hooks/useCertificateFilterStore";

//interface CertificatesTableOptionsProps {
//  certificate?: CertificateResponse;
//}

export default function CertificatesTableOptions() {
  const { dateRange, setDateRange, clearDateRange } = useCertificateFilterStore();

  const handleClearFilter = () => {
    clearDateRange();
  };

  return (
    <div className="flex items-center gap-2">
      <DatePickerWithRange
        size="sm"
        onConfirm={(date) => {
          setDateRange(date);
        }}
        initialValue={dateRange}
        placeholder="Filtrar por fecha"
      />
      {dateRange?.from && dateRange?.to && (
        <Button variant="outline" size="sm" onClick={handleClearFilter} title="Limpiar filtro">
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
