import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Separator } from "@/shared/components/ui/separator";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import QuotationDialogs from "./_components/QuotationDialogs";
import QuotationGraph from "./_components/QuotationGraph";
import QuotationPrimaryButtons from "./_components/QuotationPrimaryButtons";
import QuotationTable from "./_components/QuotationTable";

export default function PageQuotation() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.quotations, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Cotizaciones" description="Gestione las cotizaciones" />
        <QuotationPrimaryButtons />
      </ShellHeader>
      <QuotationTable />
      <Separator className="my-4" />
      <QuotationGraph />
      <QuotationDialogs />
    </ProtectedComponent>
  );
}
