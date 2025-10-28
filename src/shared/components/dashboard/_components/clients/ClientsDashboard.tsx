"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import PeruHeatMap from "./PeruHeatMap";

export default function ClientsDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Análisis detallado de clientes y su comportamiento</CardDescription>
      </CardHeader>
      <CardContent>
        <PeruHeatMap />
      </CardContent>
    </Card>
  );
}
