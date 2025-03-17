"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import ActivitiesList from "./ActivitiesList";
import ObjectivesDialogs from "./ObjectivesDialogs";
import ObjectivesList from "./ObjectivesList";
import ServicesDialogs from "./ServicesDialogs";
import ServicesList from "./ServicesList";

export default function ContainerServices() {
  return (
    <>
      <ServicesDialogs />
      <ObjectivesDialogs />
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[calc(100vh-160px)] max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full"
      >
        <ResizablePanel defaultSize={40} minSize={40} className="p-4 flex flex-col">
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
    </>
  );
}
