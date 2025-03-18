import { useCallback, useEffect, useMemo, useState } from "react";

import departamentsData from "@/shared/data/departaments.json";
import districtsData from "@/shared/data/districts.json";
import provincesData from "@/shared/data/provinces.json";

// Definimos las interfaces para los datos
export interface UbigeoOption {
  value: string;
  label: string;
  id?: string;
}

export interface UbigeoData {
  id_ubigeo: string;
  nombre_ubigeo: string;
  codigo_ubigeo: string;
  etiqueta_ubigeo: string;
  buscador_ubigeo: string;
  numero_hijos_ubigeo: string;
  nivel_ubigeo: string;
  id_padre_ubigeo: string;
}

// Interfaces para los archivos JSON
type DepartamentsData = UbigeoData[];

interface ProvincesData {
  [departmentId: string]: UbigeoData[];
}

interface DistrictsData {
  [provinceId: string]: UbigeoData[];
}

interface UseUbigeoProps {
  initialDepartment?: string;
  initialProvince?: string;
  initialDistrict?: string;
  onDepartmentChange?: (value: string) => void;
  onProvinceChange?: (value: string) => void;
  onDistrictChange?: (value: string) => void;
}

export function useUbigeo({
  initialDepartment = "",
  initialProvince = "",
  initialDistrict = "",
  onDepartmentChange,
  onProvinceChange,
  onDistrictChange,
}: UseUbigeoProps = {}) {
  // Estados para almacenar selecciones actuales
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment);
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);

  // Estados para almacenar datos filtrados
  const [filteredProvinces, setFilteredProvinces] = useState<UbigeoData[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<UbigeoData[]>([]);

  // Opciones de departamentos memoizadas
  const departmentOptions = useMemo(() => {
    return (departamentsData as DepartamentsData).map((dept: UbigeoData) => ({
      value: dept.nombre_ubigeo,
      label: dept.nombre_ubigeo,
      id: dept.id_ubigeo,
    }));
  }, []);

  // Cargar provincias cuando cambia el departamento
  const loadProvinces = useCallback((departmentName: string) => {
    if (!departmentName) {
      setFilteredProvinces([]);
      return;
    }

    try {
      // Buscar el ID del departamento seleccionado
      const department = (departamentsData as DepartamentsData).find(
        (d: UbigeoData) => d.nombre_ubigeo === departmentName
      );

      if (!department) {
        console.error("Departamento no encontrado:", departmentName);
        setFilteredProvinces([]);
        return;
      }

      // Acceder a las provincias usando el ID del departamento como clave
      const provinces = (provincesData as ProvincesData)[department.id_ubigeo] || [];

      setFilteredProvinces(provinces);
    } catch (error) {
      console.error("Error al cargar provincias:", error);
      setFilteredProvinces([]);
    }
  }, []);

  // Cargar distritos cuando cambia la provincia
  const loadDistricts = useCallback(
    (provinceName: string) => {
      if (!provinceName) {
        setFilteredDistricts([]);
        return;
      }

      try {
        // Buscar el ID de la provincia seleccionada
        const province = filteredProvinces.find((p) => p.nombre_ubigeo === provinceName);

        if (!province) {
          console.error("Provincia no encontrada:", provinceName);
          setFilteredDistricts([]);
          return;
        }

        // Acceder a los distritos usando el ID de la provincia como clave
        const districts = (districtsData as DistrictsData)[province.id_ubigeo] || [];

        setFilteredDistricts(districts);
      } catch (error) {
        console.error("Error al cargar distritos:", error);
        setFilteredDistricts([]);
      }
    },
    [filteredProvinces]
  );

  // Manejador para el cambio de departamento
  const handleDepartmentChange = useCallback(
    (value: string) => {
      setSelectedDepartment(value);
      // Limpiar provincia y distrito inmediatamente
      setSelectedProvince("");
      setSelectedDistrict("");
      // Limpiar datos filtrados de provincia y distrito
      setFilteredProvinces([]);
      setFilteredDistricts([]);

      // Cargar nuevas provincias
      if (value) {
        loadProvinces(value);
      }

      if (onDepartmentChange) {
        onDepartmentChange(value);
      }

      if (onProvinceChange) {
        onProvinceChange("");
      }

      if (onDistrictChange) {
        onDistrictChange("");
      }
    },
    [onDepartmentChange, onProvinceChange, onDistrictChange, loadProvinces]
  );

  // Manejador para el cambio de provincia
  const handleProvinceChange = useCallback(
    (value: string) => {
      setSelectedProvince(value);
      // Limpiar distrito inmediatamente
      setSelectedDistrict("");
      // Limpiar datos filtrados de distrito
      setFilteredDistricts([]);

      // Cargar nuevos distritos
      if (value) {
        loadDistricts(value);
      }

      if (onProvinceChange) {
        onProvinceChange(value);
      }

      if (onDistrictChange) {
        onDistrictChange("");
      }
    },
    [onProvinceChange, onDistrictChange, loadDistricts]
  );

  // Manejador para el cambio de distrito
  const handleDistrictChange = useCallback(
    (value: string) => {
      setSelectedDistrict(value);

      if (onDistrictChange) {
        onDistrictChange(value);
      }
    },
    [onDistrictChange]
  );

  // Efecto para cargar provincias iniciales cuando cambia el departamento seleccionado
  useEffect(() => {
    if (selectedDepartment) {
      loadProvinces(selectedDepartment);
    }
  }, [selectedDepartment, loadProvinces]);

  // Efecto para manejar valores iniciales
  useEffect(() => {
    if (initialDepartment && initialDepartment !== selectedDepartment) {
      setSelectedDepartment(initialDepartment);
    }
  }, [initialDepartment, selectedDepartment]);

  // Efecto para manejar cambios en los valores iniciales de provincia
  useEffect(() => {
    if (initialProvince && filteredProvinces.length > 0 && initialProvince !== selectedProvince) {
      // Verificar que la provincia existe en las opciones filtradas
      const provinceExists = filteredProvinces.some((p) => p.nombre_ubigeo === initialProvince);
      if (provinceExists) {
        setSelectedProvince(initialProvince);
      } else {
        // Si la provincia no existe en el departamento actual, limpiarla
        setSelectedProvince("");
        if (onProvinceChange) {
          onProvinceChange("");
        }
      }
    }
  }, [initialProvince, filteredProvinces, selectedProvince, onProvinceChange]);

  // Efecto para manejar cambios en los valores iniciales de distrito
  useEffect(() => {
    if (initialDistrict && filteredDistricts.length > 0 && initialDistrict !== selectedDistrict) {
      // Verificar que el distrito existe en las opciones filtradas
      const districtExists = filteredDistricts.some((d) => d.nombre_ubigeo === initialDistrict);
      if (districtExists) {
        setSelectedDistrict(initialDistrict);
      } else {
        // Si el distrito no existe en la provincia actual, limpiarlo
        setSelectedDistrict("");
        if (onDistrictChange) {
          onDistrictChange("");
        }
      }
    }
  }, [initialDistrict, filteredDistricts, selectedDistrict, onDistrictChange]);

  // Opciones de provincias memoizadas
  const provinceOptions = useMemo(() => {
    return filteredProvinces.map((prov) => ({
      value: prov.nombre_ubigeo,
      label: prov.nombre_ubigeo,
      id: prov.id_ubigeo,
    }));
  }, [filteredProvinces]);

  // Opciones de distritos memoizadas
  const districtOptions = useMemo(() => {
    return filteredDistricts.map((dist) => ({
      value: dist.nombre_ubigeo,
      label: dist.nombre_ubigeo,
      id: dist.id_ubigeo,
    }));
  }, [filteredDistricts]);

  // Reset todas las selecciones
  const resetSelections = useCallback(() => {
    setSelectedDepartment("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setFilteredProvinces([]);
    setFilteredDistricts([]);

    if (onDepartmentChange) onDepartmentChange("");
    if (onProvinceChange) onProvinceChange("");
    if (onDistrictChange) onDistrictChange("");
  }, [onDepartmentChange, onProvinceChange, onDistrictChange]);

  return {
    // Valores seleccionados
    selectedDepartment,
    selectedProvince,
    selectedDistrict,

    // Opciones disponibles
    departmentOptions,
    provinceOptions,
    districtOptions,

    // Manejadores
    handleDepartmentChange,
    handleProvinceChange,
    handleDistrictChange,

    // Utilidades
    resetSelections,
  };
}
