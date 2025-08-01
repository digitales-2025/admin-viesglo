export const getInitials = (name: string) => {
  // Palabras a ignorar
  const ignore = ["DE", "LA", "LOS", "DEL", "Y", "S.A.C.", "S.A.", "S.R.L.", "E.I.R.L.", "SAC", "SRL", "EIRL"];
  // Limpia comillas y puntos
  const clean = name.replace(/[".]/g, "");
  // Separa palabras y filtra las irrelevantes
  const words = clean
    .split(" ")
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w && !ignore.includes(w));
  if (words.length === 1) return words[0][0];
  return words[0][0] + words[words.length - 1][0];
};
