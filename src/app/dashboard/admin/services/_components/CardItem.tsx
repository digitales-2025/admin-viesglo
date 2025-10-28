import { Pencil, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface CardItemProps {
  className?: string;
  title: string;
  description: string;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  badge?: React.ReactNode;
  permissions?: {
    update?: boolean;
    delete?: boolean;
  };
}

export default function CardItem({
  title,
  description,
  onClick,
  onEdit,
  onDelete,
  className,
  badge,
  permissions,
}: CardItemProps) {
  return (
    <Card className={cn("shadow-none flex flex-col gap-2 hover:cursor-pointer p-3", className)} onClick={onClick}>
      <div className={cn("flex w-full items-center", badge ? "justify-between" : "justify-end")}>
        {badge && badge}
        <div className="flex items-center gap-2">
          {permissions?.update && (
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          {permissions?.delete && (
            <Button variant="outline" size="icon" onClick={onDelete}>
              <Trash className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 justify-between">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
