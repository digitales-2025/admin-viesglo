import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import QuotationGroupDialogs from "./_components/QuotationGroupDialogs";
import QuotationGroupPrimaryButtons from "./_components/QuotationGroupPrimaryButtons";
import QuotationGroupTable from "./_components/QuotationGroupTable";

export default function PageQuotationGroups() {
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
        <ShellTitle title="Grupos de cotizaciones" description="Gestione los grupos de cotizaciones" />
        <QuotationGroupPrimaryButtons />
      </ShellHeader>
      <QuotationGroupTable />
      <QuotationGroupDialogs />
    </ProtectedComponent>
  );
}
