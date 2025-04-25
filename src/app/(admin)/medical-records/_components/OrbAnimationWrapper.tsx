"use client";

import dynamic from "next/dynamic";

import { Card, CardContent } from "@/shared/components/ui/card";

// Import the animation component dynamically to avoid SSR issues
const MLetterAnimation = dynamic(() => import("./MLetterAnimation"), { ssr: false });

export default function PolyAnimationWrapper() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center pt-6">
        <MLetterAnimation />
      </CardContent>
    </Card>
  );
}
