import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import ProyectCard from "./ProyectCard";

export default function ProyectsContainer() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full max-h-[calc(100vh-160px)] min-h-[calc(100vh-160px)] w-full"
    >
      <ResizablePanel defaultSize={40} minSize={30} className="p-4 flex flex-col">
        <ProyectCard />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20} className="p-4">
        <ProyectCard />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
