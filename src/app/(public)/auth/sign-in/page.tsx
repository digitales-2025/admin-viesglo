import Link from "next/link";
import { Metadata } from "next/types";

import LogoLarge from "@/shared/components/icons/LogoLarge";
import { ThemeSwitch } from "@/shared/components/layout/ThemeSwitch";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta",
};

export default function SignInPage() {
  return (
    <div className="relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <img
          src="/assets/bgmsm.webp"
          alt="MS & M Consulting"
          className="absolute top-0 left-0 w-full h-full object-cover inset-0"
        />
        <div className="absolute top-5 left-5 z-20  flex items-end justify-end text-lg font-medium">
          <LogoLarge className="h-16 fill-gray-900" />
        </div>
      </div>
      <div className="lg:p-8 h-full grid grid-rows-[auto_1fr]">
        <div className="flex items-center justify-end">
          <ThemeSwitch />
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-left mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Bienvenido</h1>
            <p className="text-sm text-muted-foreground">
              Ingrese su correo electrónico y contraseña para iniciar sesión
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿No puedes iniciar sesión?{" "}
            <Link
              href="mailto:msmmconsulting@gmail.com"
              className="underline underline-offset-4 hover:text-primary font-semibold"
            >
              Contáctanos
            </Link>{" "}
            .
          </p>
        </div>
      </div>
    </div>
  );
}
