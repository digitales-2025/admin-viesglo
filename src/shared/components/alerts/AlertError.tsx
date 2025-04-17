import { Button } from "../ui/button";

interface Props {
  error: Error;
  refetch: () => void;
}

export default function AlertError({ error, refetch }: Props) {
  return (
    <div className="p-2 sm:p-4 bg-destructive/10 text-destructive rounded-md flex-shrink-0 text-xs sm:text-sm">
      <p>Error: {(error as Error).message}</p>
      <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-1 sm:mt-2 text-xs h-7">
        Reintentar
      </Button>
    </div>
  );
}
