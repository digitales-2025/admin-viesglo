/**
 * Devuelve la primera letra del primer nombre del usuario y la primera letra del primer apellido
 * @param fullName - Nombre completo del usuario
 * @returns Primera letra del nombre y primera letra del apellido
 */
export function firstLetterName(fullName: string) {
  const names = fullName.split(" ");
  //eliminar los espacios
  const namesWithoutSpaces = names.filter((name) => name !== "");
  if (namesWithoutSpaces.length < 2) return namesWithoutSpaces[0]?.[0] || "";
  if (namesWithoutSpaces.length === 3) return namesWithoutSpaces[0][0] + namesWithoutSpaces[1][0];
  if (namesWithoutSpaces.length > 3) return namesWithoutSpaces[0][0] + namesWithoutSpaces[2][0];
  return namesWithoutSpaces[0][0] + namesWithoutSpaces[namesWithoutSpaces.length - 1][0];
}
