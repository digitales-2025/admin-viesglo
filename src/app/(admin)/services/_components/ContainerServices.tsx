"use client";

import { useState } from "react";
import { List, ListChecks, Target } from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useServiceStore } from "../_hooks/useServiceStore";
import ActivitiesDialogs from "./ActivitiesDialogs";
import ActivitiesList from "./ActivitiesList";
import ObjectivesDialogs from "./ObjectivesDialogs";
import ObjectivesList from "./ObjectivesList";
import ServicesDialogs from "./ServicesDialogs";
import ServicesList from "./ServicesList";

export default function ContainerServices() {
  const { selectedService, selectedObjective } = useServiceStore();
  const [activeTab, setActiveTab] = useState("services");

  // Función para determinar qué tab debe estar activa basada en selecciones
  const updateActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <ServicesDialogs />
      <ObjectivesDialogs />
      <ActivitiesDialogs />

      {/* Vista para móviles - usando Tabs */}
      <div className="md:hidden flex flex-col h-[calc(100vh-160px)]">
        <Tabs defaultValue="services" value={activeTab} onValueChange={updateActiveTab} className="w-full h-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Servicios</span>
            </TabsTrigger>
            <TabsTrigger value="objectives" disabled={!selectedService} className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Objetivos</span>
            </TabsTrigger>
            <TabsTrigger value="activities" disabled={!selectedObjective} className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Actividades</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="h-full">
            <ServicesList />
          </TabsContent>
          <TabsContent value="objectives" className="h-full">
            <ObjectivesList />
          </TabsContent>
          <TabsContent value="activities" className="h-full">
            <ActivitiesList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Vista para tablets y desktop - paneles resizables */}
      <div className="hidden md:block h-[calc(100vh-160px)]">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full"
        >
          <ResizablePanel defaultSize={40} minSize={30} className="p-4 flex flex-col">
            <ServicesList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={20} className="p-4">
            <ObjectivesList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={20} className="p-4">
            <ActivitiesList />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
