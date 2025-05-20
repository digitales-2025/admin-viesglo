import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function MetricCard({
  className,
  title,
  value,
  description,
  icon,
  isLoading,
}: {
  className?: string;
  title: string;
  value: string;
  description?: string | React.ReactNode;
  icon: React.ReactNode;
  isLoading?: boolean;
}) {
  return isLoading ? (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="w-24 h-4" />
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="text-xs text-muted-foreground">
          <Skeleton className="w-24 h-4" />
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  );
}
