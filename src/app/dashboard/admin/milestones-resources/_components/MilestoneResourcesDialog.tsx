"use client";

import React from "react";
import { Package, Plus } from "lucide-react";

import {
  useActiveResources,
  useCreateMilestoneResource,
  useMilestoneResources,
} from "@/app/dashboard/admin/milestones-resources/_hooks/use-milestone-resources";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

interface MilestoneRowContext {
  projectId: string;
  milestoneId: string;
}

type MilestoneResourcesDialogProps = {
  currentRow: MilestoneRowContext;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function MilestoneResourcesDialog({ currentRow, open, onOpenChange }: MilestoneResourcesDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const [resourceId, setResourceId] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [detail, setDetail] = React.useState<string>("");

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const activeResources = useActiveResources();
  const list = useMilestoneResources(currentRow.projectId, currentRow.milestoneId, isOpen);
  const createMutation = useCreateMilestoneResource();

  const handleAdd = async () => {
    if (!resourceId || !amount || !date) return;
    const numeric = Number(String(amount).replace(/[^0-9.]/g, ""));
    await createMutation.mutateAsync({
      params: { path: { projectId: currentRow.projectId, milestoneId: currentRow.milestoneId } },
      body: {
        resourceId,
        amount: numeric,
        date: date.toISOString().split("T")[0],
        details: detail || undefined,
      },
    });
    setResourceId("");
    setAmount("");
    setDate(undefined);
    setDetail("");
  };

  // Limpiar formulario al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      setResourceId("");
      setAmount("");
      setDate(undefined);
      setDetail("");
    }
  }, [isOpen]);

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      isDesktop={isDesktop}
      title="Recursos"
      dialogContentClassName="max-h-[90vh] px-0 sm:max-w-[900px]"
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerScrollAreaClassName="h-[60vh] px-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-1">
          <div className="text-sm mb-1">Recurso</div>
          <Select value={resourceId} onValueChange={setResourceId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Recurso" />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                const raw = activeResources.data as unknown;
                const payload =
                  raw && typeof raw === "object" && Object.prototype.hasOwnProperty.call(raw, "application/json")
                    ? (raw as Record<string, unknown>)["application/json"]
                    : activeResources.data;
                const items = Array.isArray(payload) ? (payload as { id: string; name: string }[]) : [];
                return items.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ));
              })()}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="text-sm mb-1">Monto</div>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="S/0.00" />
        </div>

        <div>
          <div className="text-sm mb-1">Fecha</div>
          <DatePicker selected={date} onSelect={setDate} placeholder="Seleccionar fecha" />
        </div>

        <div className="md:col-span-1">
          <div className="text-sm mb-1">Detalle</div>
          <Input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Escriba el detalle" />
        </div>

        <div className="md:col-span-4 flex justify-end">
          <Button onClick={handleAdd} disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" /> Agregar
          </Button>
        </div>
      </div>

      <div className="mt-4 border rounded-md">
        {(() => {
          const raw = list.data as unknown;
          const payload =
            raw && typeof raw === "object" && Object.prototype.hasOwnProperty.call(raw, "application/json")
              ? (raw as Record<string, unknown>)["application/json"]
              : list.data;
          type Row = {
            id: string;
            resourceName: string;
            amount: number;
            date: string;
            details?: string;
          };
          const rows = Array.isArray(payload) ? (payload as Row[]) : [];

          if (rows.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay recursos asignados</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Este milestone no tiene recursos asignados. Agrega recursos usando el formulario superior.
                </p>
              </div>
            );
          }

          return (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3">Recurso</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{item.resourceName}</td>
                    <td className="p-3">
                      S/{typeof item.amount === "number" ? item.amount.toFixed(2) : String(item.amount)}
                    </td>
                    <td className="p-3">{typeof item.date === "string" ? item.date.slice(0, 10) : ""}</td>
                    <td className="p-3">{item.details ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </ResponsiveDialog>
  );
}
