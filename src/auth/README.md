# Sistema de Autenticación y Autorización

Este módulo implementa un sistema robusto de autenticación y autorización basado en Clean Architecture, diseñado para manejar diferentes tipos de usuarios (admin, client, clinic) y roles con sus respectivos permisos.

## Estructura del Módulo

La estructura sigue los principios de Clean Architecture con las siguientes capas:

```
auth/
├── domain/             # Entidades y reglas de negocio independientes
│   ├── entities/       # Definición de User, Role, Permission
│   ├── repositories/   # Interfaces de repositorios
│   └── errors/         # Errores específicos del dominio
├── application/        # Casos de uso de la aplicación
│   └── usecases/       # Implementación de casos de uso
├── infrastructure/     # Implementaciones concretas
│   └── repositories/   # Implementación de repositorios
└── presentation/       # Componentes de UI y hooks
    ├── providers/      # Context providers
    ├── hooks/          # Custom hooks
    ├── guards/         # Guardias de ruta
    └── components/     # Componentes reutilizables
```

## Características Principales

### 1. Tipos de Usuario

- **Admin**: Accede al panel de administración.
- **Client**: Accede al panel de cliente.
- **Clinic**: Accede al panel de clínica.

### 2. Sistema de Roles y Permisos

- Soporte para roles múltiples (`superadmin`, `admin`, `manager`, `client`, etc.).
- Autorización basada en roles y permisos.

### 3. Protección de Rutas

- Middleware para verificar autenticación y redireccionar según tipo de usuario.
- Función `withAuth` para proteger Server Components.
- Componente `RouteGuard` para proteger Client Components.

### 4. Gestión de Tokens

- Manejo seguro de tokens JWT (access_token y refresh_token).
- Renovación automática de tokens en middleware.

## Uso

### Proteger una Ruta en Server Components

```tsx
// src/app/admin/dashboard/page.tsx
import { withAuth } from "@/auth/presentation/guards/withAuth";

export default async function AdminDashboard() {
  const userData = await withAuth({
    allowedUserTypes: ["admin"],
    allowedRoles: ["admin", "superadmin"],
  });

  return (
    <div>
      <h1>Dashboard Administrativo</h1>
      {/* Contenido... */}
    </div>
  );
}
```

### Proteger un Componente Cliente

```tsx
// Ejemplo de uso del hook useAuthRedirect
"use client";

import { useAuthRedirect } from "@/auth/presentation/hooks/useAuthRedirect";

export default function SettingsPage() {
  useAuthRedirect({
    requireAuth: true,
    allowedUserTypes: ["admin"],
    fallbackPath: "/forbidden",
  });

  return <div>Configuración</div>;
}
```

### Mostrar Componentes según Roles

```tsx
import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";

function Dashboard() {
  return (
    <div>
      {/* Este componente solo se muestra a superadmins */}
      <ProtectedComponent allowedRoles={["superadmin"]} fallback={<p>No tienes permisos para ver esta sección</p>}>
        <SuperAdminPanel />
      </ProtectedComponent>
    </div>
  );
}
```

## Seguridad

Este sistema implementa múltiples capas de seguridad:

1. **Validación en el cliente**: A través de hooks y componentes.
2. **Validación en el middleware**: Intercepta todas las peticiones antes de llegar a la aplicación.
3. **Validación en el servidor**: A través de `withAuth` en Server Components.
4. **Expiración de tokens**: Manejo automático de tokens expirados.

## Ampliación

Para añadir nuevos tipos de usuario o roles:

1. Actualizar las interfaces en `domain/entities/User.ts` y `domain/entities/Role.ts`.
2. Añadir las rutas de dashboard en el middleware y la función `getUserDashboardPath`.
3. Implementar la lógica de negocio específica en los casos de uso.

## Vulnerabilidades Mitigadas

- **Robo de sesión**: Uso de cookies HttpOnly para almacenar tokens.
- **CSRF**: Implementación de tokens anti-CSRF en solicitudes HTTP.
- **XSS**: Sanitización de datos y uso de Content Security Policy.
- **Injection**: Validación de entradas y preparación de consultas.
