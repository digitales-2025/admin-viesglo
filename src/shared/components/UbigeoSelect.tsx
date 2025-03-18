import { memo } from "react";
import { Control, useController, useWatch } from "react-hook-form";

import { AutoComplete } from "@/shared/components/ui/autocomplete";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { UbigeoOption, useUbigeo } from "@/shared/hooks/useUbigeo";

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
const UbigeoSelect = memo(({ control, initialValues = {}, onChange = {}, required = false }: UbigeoSelectProps) => {
  // Observar los cambios de valores en el formulario
  const watchedValues = useWatch({
    control,
    name: ["department", "province", "district"],
    defaultValue: [initialValues.department || "", initialValues.province || "", initialValues.district || ""],
  });

  const [watchedDepartment, watchedProvince] = watchedValues;

  // Obtenemos funciones para actualizar valores
  const { field: provinceField } = useController({ name: "province", control });
  const { field: districtField } = useController({ name: "district", control });

  const {
    departmentOptions,
    provinceOptions,
    districtOptions,
    handleDepartmentChange,
    handleProvinceChange,
    handleDistrictChange,
  } = useUbigeo({
    initialDepartment: initialValues.department,
    initialProvince: initialValues.province,
    initialDistrict: initialValues.district,
    onDepartmentChange: onChange.department,
    onProvinceChange: onChange.province,
    onDistrictChange: onChange.district,
  });

  // Manejar limpieza de provincia y distrito cuando cambia el departamento
  const handleDepartmentChangeWithReset = (value: string) => {
    // Primero limpiar los valores de provincia y distrito
    if (value !== watchedDepartment) {
      // Usar los campos directamente
      provinceField.onChange("");
      districtField.onChange("");
    }

    // Luego manejar el cambio del departamento
    handleDepartmentChange(value);
  };

  // Manejar limpieza de distrito cuando cambia la provincia
  const handleProvinceChangeWithReset = (value: string) => {
    // Primero limpiar el valor del distrito
    if (value !== watchedProvince) {
      // Usar el campo directamente
      districtField.onChange("");
    }

    // Luego manejar el cambio de la provincia
    handleProvinceChange(value);
  };

  return (
    <>
      <FormField
        control={control}
        name="department"
        rules={{ required: required ? "El departamento es requerido" : false }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Departamento {required && <span className="text-red-500">*</span>}</FormLabel>
            <FormControl>
              <AutoComplete
                options={departmentOptions}
                placeholder="Selecciona un departamento"
                emptyMessage="No hay departamentos disponibles"
                value={{ value: field.value || "", label: field.value || "" }}
                onValueChange={(option: UbigeoOption) => {
                  field.onChange(option.value);
                  handleDepartmentChangeWithReset(option.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        key={`province-field-${watchedDepartment}`} // Forzar recreación del FormField completo
        control={control}
        name="province"
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
                value={{ value: field.value || "", label: field.value || "" }}
                onValueChange={(option: UbigeoOption) => {
                  field.onChange(option.value);
                  handleProvinceChangeWithReset(option.value);
                }}
                disabled={provinceOptions.length === 0}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        key={`district-field-${watchedDepartment}-${watchedProvince}`} // Forzar recreación del FormField completo
        control={control}
        name="district"
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
                value={{ value: field.value || "", label: field.value || "" }}
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
});

UbigeoSelect.displayName = "UbigeoSelect";

export default UbigeoSelect;
