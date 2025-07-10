import Link from "next/link";
import type { Metadata } from "next/types";

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
      {/* Left side - Hero section with enhanced visuals */}
      <div className="relative hidden h-full flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-10 text-white dark:border-r lg:flex overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img src="/assets/bgmsm.webp" alt="Viesglo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/10 backdrop-blur-[1px]" />
        </div>

        {/* Bottom decoration */}
        <div className="relative z-10 mt-auto flex items-end justify-between w-full">
          <div className="text-sm font-normal text-white/60">© {new Date().getFullYear()} Viesglo</div>
          <div className="flex gap-2">
            <div className="w-8 h-1 bg-white/30 rounded-full" />
            <div className="w-4 h-1 bg-white/50 rounded-full" />
            <div className="w-2 h-1 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right side - Login form with enhanced styling */}
      <div className="lg:p-8 h-full grid grid-rows-[auto_1fr] bg-gradient-to-br from-background via-background to-muted/30">
        {/* Header with theme switch */}
        <div className="flex items-center justify-end p-4">
          <div className="flex items-center gap-4">
            <ThemeSwitch />
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px] px-6">
          {/* Welcome section with enhanced styling */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <LogoLarge className="h-12 fill-white drop-shadow-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Bienvenido
              </h1>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Accede al panel de control y continúa gestionando tus proyectos de manera eficiente
              </p>
            </div>
          </div>

          {/* Login form */}
          <div className="space-y-6">
            <LoginForm />

            {/* Enhanced footer */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">¿Necesitas ayuda?</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿Problemas para acceder?{" "}
                  <Link
                    href="mailto:msmmconsulting@gmail.com"
                    className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                  >
                    Contáctanos
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
