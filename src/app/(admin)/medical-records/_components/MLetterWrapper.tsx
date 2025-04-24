"use client";

import dynamic from "next/dynamic";

import { Card, CardContent } from "@/shared/components/ui/card";

// Import the animation component dynamically to avoid SSR issues
const MLetterAnimation = dynamic(() => import("./MLetterAnimation"), { ssr: false });

export default function MLetterWrapper() {
  return (
    <Card className="w-[180px] mx-auto">
      <CardContent className="flex items-center justify-center pt-4 pb-4 px-4">
        <MLetterAnimation />
      </CardContent>
    </Card>
  );
}
