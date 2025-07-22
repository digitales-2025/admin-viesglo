import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import QuotationGroupDialogs from "./_components/QuotationGroupDialogs";
import QuotationGroupPrimaryButtons from "./_components/QuotationGroupPrimaryButtons";
import QuotationGroupTable from "./_components/QuotationGroupTable";

export default function PageQuotationGroups() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Grupos de cotizaciones" description="Gestione los grupos de cotizaciones" />
        <QuotationGroupPrimaryButtons />
      </ShellHeader>
      <QuotationGroupTable />
      <QuotationGroupDialogs />
    </>
  );
}
