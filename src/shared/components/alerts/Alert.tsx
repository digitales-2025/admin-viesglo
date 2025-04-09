import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";

interface AlertProps {
  title: string;
  description: string;
  variant: "default" | "destructive" | "info" | "warning";
}

export default function AlertMessage({ title, description, variant }: AlertProps) {
  return (
    <Alert variant={variant}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
