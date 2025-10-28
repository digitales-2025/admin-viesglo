import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Separator } from "@/shared/components/ui/separator";
import PaymentDialogs from "./_components/PaymentDialogs";
import PaymentGraph from "./_components/PaymentGraph";
import PaymentTable from "./_components/PaymentTable";

export default function PagePayment() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Pagos" description="Gestione los pagos" />
      </ShellHeader>
      <PaymentTable />
      <Separator className="my-4" />
      <PaymentGraph />
      <PaymentDialogs />
    </>
  );
}
