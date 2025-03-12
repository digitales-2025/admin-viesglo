/**
 * Devuelve la primera letra del nombre del usuario y la primera letra del apellido
 * @param fullName - Nombre completo del usuario
 * @returns Primera letra del nombre y primera letra del apellido
 */
export function firstLetterName(fullName: string) {
  return fullName
    .split(" ")
    .map((name) => name[0])
    .join("");
}
