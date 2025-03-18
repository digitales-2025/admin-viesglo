import { cn } from "@/shared/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("bg-slate-400/10 animate-pulse rounded-md", className)} {...props} />;
}

export { Skeleton };
