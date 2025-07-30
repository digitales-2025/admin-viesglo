import { ChevronDown, Settings } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Separator } from "@/shared/components/ui/separator";
import { PasswordOptions } from "../../_utils/user.utils";

interface Props {
  passwordOptions: PasswordOptions;
  setPasswordOptions: React.Dispatch<React.SetStateAction<PasswordOptions>>;
}

export default function PasswordOptionsCollapsible({ passwordOptions, setPasswordOptions }: Props) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-3 h-3 mr-1" />
          Opciones de contraseña
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 mt-2">
        <div className="bg-muted/30 rounded-md p-3 border">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeUppercase}
                  onChange={(e) =>
                    setPasswordOptions((prev) => ({
                      ...prev,
                      includeUppercase: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Mayúsculas (A-Z)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeLowercase}
                  onChange={(e) =>
                    setPasswordOptions((prev) => ({
                      ...prev,
                      includeLowercase: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Minúsculas (a-z)
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeNumbers}
                  onChange={(e) =>
                    setPasswordOptions((prev) => ({
                      ...prev,
                      includeNumbers: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Números (0-9)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.includeSymbols}
                  onChange={(e) =>
                    setPasswordOptions((prev) => ({
                      ...prev,
                      includeSymbols: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Símbolos (!@#$...)
              </label>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium">Longitud:</label>
            <input
              type="range"
              min="8"
              max="32"
              value={passwordOptions.length}
              onChange={(e) =>
                setPasswordOptions((prev) => ({
                  ...prev,
                  length: Number.parseInt(e.target.value),
                }))
              }
              className="flex-1"
            />
            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{passwordOptions.length}</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
