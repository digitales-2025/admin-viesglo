import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Separator } from "@/shared/components/ui/separator";
import QuotationDialogs from "./_components/QuotationDialogs";
import QuotationGraph from "./_components/QuotationGraph";
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
      <Separator className="my-4" />
      <QuotationGraph />
      <QuotationDialogs />
    </>
  );
}
