import { PasswordRequirement } from "../_types/password";

export function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return "Hoy";
  }
  if (diffDays === 1) {
    return "Ayer";
  }
  return `Hace ${diffDays} días`;
}

export const getPasswordStrength = (passwordRequirements: PasswordRequirement[]) => {
  const metRequirements = passwordRequirements.filter((req) => req.met).length;
  return (metRequirements / passwordRequirements.length) * 100;
};

export const getStrengthText = (passwordRequirements: PasswordRequirement[]) => {
  const strength = getPasswordStrength(passwordRequirements);
  if (strength < 40) {
    return "Débil";
  }
  if (strength < 80) {
    return "Media";
  }
  return "Fuerte";
};

export const getProgressColor = (passwordRequirements: PasswordRequirement[]) => {
  const strength = getPasswordStrength(passwordRequirements);
  if (strength < 40) {
    return "bg-red-500 dark:bg-red-600";
  }
  if (strength < 80) {
    return "bg-yellow-500 dark:bg-yellow-600";
  }
  return "bg-emerald-600 dark:bg-emerald-500";
};
