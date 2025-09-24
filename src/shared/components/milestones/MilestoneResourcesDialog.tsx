"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  useActiveResources,
  useCreateMilestoneResource,
  useDeleteMilestoneResource,
  useMilestoneResources,
} from "@/shared/hooks/resources/use-milestone-resources";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

type MilestoneResourcesDialogProps = {
  projectId: string;
  milestoneId: string;
  trigger?: React.ReactNode;
};

export function MilestoneResourcesDialog({ projectId, milestoneId, trigger }: MilestoneResourcesDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [resourceId, setResourceId] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  const [detail, setDetail] = React.useState<string>("");

  const activeResources = useActiveResources();
  const list = useMilestoneResources(projectId, milestoneId, open);
  const createMutation = useCreateMilestoneResource();
  const deleteMutation = useDeleteMilestoneResource();

  const handleAdd = async () => {
    if (!resourceId || !amount || !date) return;
    const numeric = Number(String(amount).replace(/[^0-9.]/g, ""));
    await createMutation.mutateAsync({
      params: { path: { projectId, milestoneId } },
      body: { resourceId, amount: numeric, date, detail },
    } as any);
    setResourceId("");
    setAmount("");
    setDate("");
    setDetail("");
  };

  const handleRemove = async (id: string) => {
    await deleteMutation.mutateAsync({ params: { path: { projectId, milestoneId, id } } } as any);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button variant="secondary">Recursos</Button>}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Recursos</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <div className="text-sm mb-1">Recurso</div>
            <Select value={resourceId} onValueChange={setResourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                {(activeResources.data ?? []).map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="text-sm mb-1">Monto</div>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="S/0.00" />
          </div>

          <div>
            <div className="text-sm mb-1">Fecha</div>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Recurso</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Detalle</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.resourceName ?? item.resource?.name}</td>
                  <td className="p-3">S/{item.amount?.toFixed ? item.amount.toFixed(2) : item.amount}</td>
                  <td className="p-3">{item.date?.slice(0, 10)}</td>
                  <td className="p-3">{item.detail}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
