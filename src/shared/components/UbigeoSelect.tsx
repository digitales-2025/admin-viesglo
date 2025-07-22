"use client";

import { memo, ReactNode, useEffect, useState } from "react";
import { useWatch, type Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { useUbigeo, type UbigeoOption } from "@/shared/hooks/useUbigeo";
import { AutoComplete } from "./ui/autocomplete-ubigeo";

interface UbigeoSelectProps {
  control: Control<any>;
  // NUEVO: Permitir configurar los nombres de los campos
  fieldNames?: {
    department: string;
    province: string;
    district: string;
  };
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
  icons?: {
    department?: ReactNode;
    province?: ReactNode;
    district?: ReactNode;
  };
}

/**
 * Componente reutilizable para selección de Departamento, Provincia y Distrito
 */
const UbigeoSelect = memo(
  ({
    control,
    fieldNames = {
      department: "department",
      province: "province",
      district: "district",
    },
    onChange = {},
    required = false,
    icons = {},
  }: UbigeoSelectProps) => {
    // Estado para forzar re-render de los AutoComplete
    const [renderKey, setRenderKey] = useState(0);

    // Observar los cambios de valores en el formulario usando los nombres configurables
    const [watchedDepartment, watchedProvince, watchedDistrict] = useWatch({
      control,
      name: [fieldNames.department, fieldNames.province, fieldNames.district],
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

    // Efecto para forzar re-render cuando cambien los valores del formulario
    useEffect(() => {
      if (watchedDepartment || watchedProvince || watchedDistrict) {
        setRenderKey((prev) => prev + 1);
      }
    }, [watchedDepartment, watchedProvince, watchedDistrict]);

    return (
      <>
        <FormField
          control={control}
          name={fieldNames.department}
          rules={{ required: required ? "El departamento es requerido" : false }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                {/* Icono opcional */}
                {icons.department}
                Departamento {required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <AutoComplete
                  key={`department-${renderKey}`}
                  options={departmentOptions}
                  placeholder="Selecciona un departamento"
                  emptyMessage="No hay departamentos disponibles"
                  value={{
                    value: field.value || "",
                    label: field.value || "",
                  }}
                  onValueChange={(option: UbigeoOption) => {
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
          name={fieldNames.province}
          rules={{ required: required ? "La provincia es requerida" : false }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                {/* Icono opcional */}
                {icons.province}
                Provincia {required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <AutoComplete
                  key={`province-${renderKey}-${watchedDepartment}`}
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
          name={fieldNames.district}
          rules={{ required: required ? "El distrito es requerido" : false }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                {/* Icono opcional */}
                {icons.district}
                Distrito {required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <AutoComplete
                  key={`district-${renderKey}-${watchedDepartment}-${watchedProvince}`}
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
  }
);

UbigeoSelect.displayName = "UbigeoSelect";

export default UbigeoSelect;
