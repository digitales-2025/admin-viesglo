"use client";

import Link from "next/link";

import { getUserDashboardPath } from "@/auth/domain/entities/User";

export default function ForbiddenPage() {
  const dashboardPath = getUserDashboardPath();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>

        <div className="text-7xl mb-4">🚫</div>

        <p className="mb-6 text-gray-700">
          No tienes permiso para acceder a esta página. Por favor, contacta con un administrador si crees que esto es un
          error.
        </p>

        <div className="space-y-2">
          <Link
            href={dashboardPath}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ir a mi Dashboard
          </Link>

          <Link
            href="/auth/sign-in"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            Iniciar Sesión con otra Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
