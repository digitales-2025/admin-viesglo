/**
 * Devuelve la primera letra del primer nombre del usuario y la primera letra del primer apellido
 * @param fullName - Nombre completo del usuario
 * @returns Primera letra del nombre y primera letra del apellido
 */
export function firstLetterName(fullName: string) {
  const names = fullName.split(" ");
  if (names.length < 2) return names[0]?.[0] || "";
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
}
