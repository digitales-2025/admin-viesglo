import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import QuotationDialogs from "./_components/QuotationDialogs";
import QuotationPrimaryButtons from "./_components/QuotationPrimaryButtons";
import QuotationTable from "./_components/QuotationTable";

export default function PageQuotation() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Cotizaciones" description="Gestione las cotizaciones" />
        <QuotationPrimaryButtons />
      </ShellHeader>
      <QuotationTable />
      <QuotationDialogs />
    </>
  );
}
