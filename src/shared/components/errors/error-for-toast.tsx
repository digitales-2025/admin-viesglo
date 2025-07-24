import { BaseErrorResponse } from "@/lib/api/types/common";
import { Label } from "../ui/label";

export const ToastErrorMessage = ({ error }: { error: BaseErrorResponse }) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        <Label className="text-destructive font-medium">{error.error?.message}</Label>
      </div>
      {error.error?.userMessage && error.error?.message !== error.error?.userMessage && (
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">{error.error?.userMessage}</p>
      )}
    </div>
  );
};
