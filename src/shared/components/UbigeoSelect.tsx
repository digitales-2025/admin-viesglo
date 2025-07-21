"use client";

import { memo } from "react";
import { useWatch, type Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { useUbigeo, type UbigeoOption } from "@/shared/hooks/useUbigeo";
import { AutoComplete } from "./ui/autocomplete-ubigeo";

interface UbigeoSelectProps {
  control: Control<any>;
  initialValues?: {
    department?: string;
    province?: string;
    district?: string;
  };
  onChange?: {
    department?: (value: string) => void;
    province?: (value: string) => void;
    district?: (value: string) => void;
  };
  required?: boolean;
}

/**
 * Componente reutilizable para selección de Departamento, Provincia y Distrito
 */
const UbigeoSelect = memo(({ control, onChange = {}, required = false }: UbigeoSelectProps) => {
  // Observar los cambios de valores en el formulario
  const [watchedDepartment, watchedProvince, watchedDistrict] = useWatch({
    control,
    name: ["sunatInfo.department", "sunatInfo.province", "sunatInfo.district"],
  });

  console.log("UbigeoSelect - Valores del formulario:", {
    watchedDepartment,
    watchedProvince,
    watchedDistrict,
  });

  const {
    departmentOptions,
    provinceOptions,
    districtOptions,
    handleDepartmentChange,
    handleProvinceChange,
    handleDistrictChange,
  } = useUbigeo({
    initialDepartment: watchedDepartment || "",
    initialProvince: watchedProvince || "",
    initialDistrict: watchedDistrict || "",
    onDepartmentChange: onChange.department,
    onProvinceChange: onChange.province,
    onDistrictChange: onChange.district,
  });

  return (
    <>
      <FormField
        control={control}
        name="sunatInfo.department"
        rules={{ required: required ? "El departamento es requerido" : false }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departamento {required && <span className="text-red-500">*</span>}</FormLabel>
            <FormControl>
              <AutoComplete
                options={departmentOptions}
                placeholder="Selecciona un departamento"
                emptyMessage="No hay departamentos disponibles"
                value={{
                  value: field.value || "",
                  label: field.value || "",
                }}
                onValueChange={(option: UbigeoOption) => {
                  console.log("Departamento seleccionado:", option.value);
                  field.onChange(option.value);
                  handleDepartmentChange(option.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="sunatInfo.province"
        rules={{ required: required ? "La provincia es requerida" : false }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provincia {required && <span className="text-red-500">*</span>}</FormLabel>
            <FormControl>
              <AutoComplete
                options={provinceOptions}
                placeholder="Selecciona una provincia"
                emptyMessage={
                  !watchedDepartment
                    ? "Primero selecciona un departamento"
                    : "No hay provincias disponibles para este departamento"
                }
                value={{
                  value: field.value || "",
                  label: field.value || "",
                }}
                onValueChange={(option: UbigeoOption) => {
                  console.log("Provincia seleccionada:", option.value);
                  field.onChange(option.value);
                  handleProvinceChange(option.value);
                }}
                disabled={provinceOptions.length === 0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="sunatInfo.district"
        rules={{ required: required ? "El distrito es requerido" : false }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Distrito {required && <span className="text-red-500">*</span>}</FormLabel>
            <FormControl>
              <AutoComplete
                options={districtOptions}
                placeholder="Selecciona un distrito"
                emptyMessage={
                  !watchedProvince
                    ? "Primero selecciona una provincia"
                    : "No hay distritos disponibles para esta provincia"
                }
                value={{
                  value: field.value || "",
                  label: field.value || "",
                }}
                onValueChange={(option: UbigeoOption) => {
                  console.log("Distrito seleccionado:", option.value);
                  field.onChange(option.value);
                  handleDistrictChange(option.value);
                }}
                disabled={districtOptions.length === 0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
});

UbigeoSelect.displayName = "UbigeoSelect";

export default UbigeoSelect;
