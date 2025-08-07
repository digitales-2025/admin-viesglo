import { BadgeCheck, Building2, Landmark, Map, MapPin, ShieldCheck } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import UbigeoSelect from "@/shared/components/UbigeoSelect";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CreateClientFormData } from "../../_schemas/clients.schemas";
import { clientConditionConfig, clientStateConfig } from "../../_utils/clients.utils";

interface ClientsSunatInformationFormProps {
  form: UseFormReturn<CreateClientFormData>;
}

export default function ClientsSunatInformationForm({ form }: ClientsSunatInformationFormProps) {
  return (
    <div className="space-y-4 px-2">
      <div className="absolute -left-6 top-0 w-px h-full bg-border" />
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="sunatInfo.businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                Razón Social SUNAT
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="EMPRESA S.A.C." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sunatInfo.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                Estado
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(clientStateConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className={`flex items-center gap-2`}>
                          <config.icon className={`w-4 h-4 ${config.iconClass}`} />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sunatInfo.condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
              Condición
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona condición" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(clientConditionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className={`flex items-center gap-2`}>
                        <config.icon className={`w-4 h-4 ${config.iconClass}`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="sunatInfo.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                Dirección Fiscal
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Av. Principal 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sunatInfo.fullAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <Map className="h-4 w-4 text-muted-foreground shrink-0" />
                Dirección Completa
              </FormLabel>
              <FormControl>
                <Input placeholder="Av. Principal 123, Lima, Lima" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <UbigeoSelect
          control={form.control}
          fieldNames={{
            department: "sunatInfo.department",
            province: "sunatInfo.province",
            district: "sunatInfo.district",
          }}
          required={true}
          icons={{
            department: <Landmark className="h-4 w-4 text-muted-foreground" />,
            province: <MapPin className="h-4 w-4 text-muted-foreground" />,
            district: <Map className="h-4 w-4 text-muted-foreground" />,
          }}
        />
      </div>
    </div>
  );
}
