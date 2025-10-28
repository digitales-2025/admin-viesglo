import { Metadata } from "next";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import DiagnosticsDialogs from "./_components/DiagnosticsDialogs";
import DiagnosticsPrimaryButtons from "./_components/DiagnosticsPrimaryButtons";
import DiagnosticsTable from "./_components/DiagnosticsTable";

export const metadata: Metadata = {
  title: "Administrador de diagnósticos",
};

export default function DiagnosticsPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Diagnósticos" description="Gestiona los diagnósticos aquí." />
        <DiagnosticsPrimaryButtons />
      </ShellHeader>
      <DiagnosticsTable />
      <DiagnosticsDialogs />
    </>
  );
}
