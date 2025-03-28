import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import PaymentDialogs from "./_components/PaymentDialogs";
import PaymentTable from "./_components/PaymentTable";

export default function PagePayment() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Pagos" description="Gestione los pagos" />
      </ShellHeader>
      <PaymentTable />
      <PaymentDialogs />
    </>
  );
}
