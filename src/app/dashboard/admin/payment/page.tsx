import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Separator } from "@/shared/components/ui/separator";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import PaymentDialogs from "./_components/PaymentDialogs";
import PaymentGraph from "./_components/PaymentGraph";
import PaymentTable from "./_components/PaymentTable";

export default function PagePayment() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Pagos" description="Gestione los pagos" />
      </ShellHeader>
      <PaymentTable />
      <Separator className="my-4" />
      <PaymentGraph />
      <PaymentDialogs />
    </ProtectedComponent>
  );
}
