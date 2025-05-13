import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

interface Props {
  text?: string;
  to: string;
  linkText: string;
}

export default function Redirect({ text = "No hay datos disponibles", to, linkText }: Props) {
  return (
    <div className="text-muted-foreground text-xs flex-col flex gap-1">
      {text}
      <Link href={to} className={cn("text-muted-foreground text-xs", buttonVariants({ variant: "ghost", size: "sm" }))}>
        <PlusCircle className="w-4 h-4" />
        {linkText}
      </Link>
    </div>
  );
}
