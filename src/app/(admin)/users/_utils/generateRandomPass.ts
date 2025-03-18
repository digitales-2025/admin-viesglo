import { generate } from "generate-password";

export function generateRandomPass() {
  const password = generate({
    length: 10,
    numbers: true,
    uppercase: true,
    lowercase: true,
  });

  // Verificamos si la contraseña es segura tenga al menos 8 caracteres, una mayúscula, una minúscula y un número
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return generateRandomPass();
  }

  return password;
}
