# ProtectedComponent - Guía de Uso

## Descripción

`ProtectedComponent` es un componente robusto y genérico que permite proteger contenido basándose en permisos y roles del usuario. Utiliza los permisos del backend definidos en `authorization-types.ts`.

## Características

- ✅ **Verificación de permisos**: Basada en recursos y acciones del backend
- ✅ **Verificación de roles**: Soporte para roles específicos
- ✅ **Lógica flexible**: AND/OR para múltiples permisos/roles
- ✅ **Roles del sistema**: Soporte para roles predefinidos
- ✅ **Exclusión de roles**: Posibilidad de excluir ciertos roles
- ✅ **Estados de carga**: Manejo automático de estados de autenticación
- ✅ **Fallbacks personalizables**: Mensajes de error personalizados
- ✅ **Ocultación opcional**: Opción de ocultar contenido en lugar de mostrar mensaje

## Componentes Disponibles

### 1. ProtectedComponent (Principal)
Componente base con todas las funcionalidades.

### 2. Componentes Especializados
- `PermissionProtected`: Solo verificación de permisos
- `RoleProtected`: Solo verificación de roles
- `SystemRoleProtected`: Solo roles del sistema
- `ExcludeRoleProtected`: Excluir roles específicos

### 3. Componentes por Rol del Sistema
- `ManagementProtected`: Solo MANAGEMENT
- `PlannerProtected`: Solo PLANNER
- `ConsultantProtected`: Solo CONSULTANT
- `ManagementOrPlannerProtected`: MANAGEMENT o PLANNER
- `SystemRolesProtected`: Cualquier rol del sistema

## Ejemplos de Uso

### 1. Verificación de Permisos Básica

```tsx
import { PermissionProtected } from "@/shared/components/protected-component";

// Usuario necesita permiso de lectura en proyectos
<PermissionProtected
  permissions={[{ resource: "projects", action: "read" }]}
  fallback={<div>No tienes permiso para ver proyectos</div>}
>
  <ProjectList />
</PermissionProtected>
```

### 2. Múltiples Permisos (OR)

```tsx
// Usuario necesita AL MENOS UNO de estos permisos
<PermissionProtected
  permissions={[
    { resource: "projects", action: "read" },
    { resource: "milestones", action: "read" }
  ]}
  requireAll={false} // OR
  fallback={<div>No tienes permisos suficientes</div>}
>
  <Content />
</PermissionProtected>
```

### 3. Múltiples Permisos (AND)

```tsx
// Usuario necesita TODOS estos permisos
<PermissionProtected
  permissions={[
    { resource: "projects", action: "read" },
    { resource: "milestones", action: "manage" }
  ]}
  requireAll={true} // AND
  fallback={<div>Necesitas permisos de lectura en proyectos Y gestión de hitos</div>}
>
  <AdvancedContent />
</PermissionProtected>
```

### 4. Verificación de Roles

```tsx
import { RoleProtected } from "@/shared/components/protected-component";

// Solo para roles específicos
<RoleProtected
  roles={["MANAGEMENT", "PLANNER"]}
  requireAll={false} // OR: MANAGEMENT o PLANNER
  fallback={<div>Solo para gestión y planificadores</div>}
>
  <AdminPanel />
</RoleProtected>
```

### 5. Solo Roles del Sistema

```tsx
import { SystemRoleProtected } from "@/shared/components/protected-component";

<SystemRoleProtected fallback={<div>Solo para roles del sistema</div>}>
  <SystemSettings />
</SystemRoleProtected>
```

### 6. Excluir Roles

```tsx
import { ExcludeRoleProtected } from "@/shared/components/protected-component";

// Mostrar para todos excepto CONSULTANT
<ExcludeRoleProtected
  excludeRoles={["CONSULTANT"]}
  fallback={<div>Acceso restringido para consultores</div>}
>
  <ManagementContent />
</ExcludeRoleProtected>
```

### 7. Componente Completo con Múltiples Restricciones

```tsx
import { ProtectedComponent } from "@/shared/components/protected-component";

<ProtectedComponent
  requiredPermissions={[
    { resource: "projects", action: "read" },
    { resource: "milestones", action: "read" }
  ]}
  requireAllPermissions={false} // OR para permisos
  allowedRoles={["MANAGEMENT", "PLANNER"]}
  requireAllRoles={false} // OR para roles
  isSystemRole={true} // Solo roles del sistema
  excludeRoles={["CONSULTANT"]} // Excluir consultores
  fallback={<div>Acceso restringido</div>}
>
  <ComplexContent />
</ProtectedComponent>
```

### 8. Casos de Uso Específicos por Rol

```tsx
import { 
  ManagementProtected, 
  PlannerProtected, 
  ConsultantProtected 
} from "@/shared/components/protected-component";

// Solo para gestión
<ManagementProtected fallback={<div>Solo para gestión</div>}>
  <SystemAdminPanel />
</ManagementProtected>

// Solo para planificadores
<PlannerProtected fallback={<div>Solo para planificadores</div>}>
  <ProjectPlanningTools />
</PlannerProtected>

// Solo para consultores
<ConsultantProtected fallback={<div>Solo para consultores</div>}>
  <ActivityTracker />
</ConsultantProtected>

// Para gestión o planificadores
<ManagementOrPlannerProtected fallback={<div>Solo para gestión y planificadores</div>}>
  <ProjectManagementTools />
</ManagementOrPlannerProtected>
```

### 9. Ocultar Contenido vs Mostrar Mensaje

```tsx
import { PermissionProtected } from "@/shared/components/protected-component";

// OPCIÓN 1: Mostrar mensaje de error (comportamiento por defecto)
<PermissionProtected
  permissions={[{ resource: "milestones", action: "read" }]}
  fallback={<div>No tienes permisos para ver este contenido</div>}
  hideOnUnauthorized={false} // Por defecto
>
  <Content />
</PermissionProtected>

// OPCIÓN 2: Ocultar completamente el contenido
<PermissionProtected
  permissions={[{ resource: "milestones", action: "write" }]}
  hideOnUnauthorized={true} // Ocultar si no tiene permisos
>
  <Button>Agregar hito</Button>
</PermissionProtected>
```

### 10. Ejemplo Real: Lista de Hitos

```tsx
import { PermissionProtected } from "@/shared/components/protected-component";

export const ListMilestonesProject = () => {
  return (
    <PermissionProtected
      permissions={[
        { resource: "milestones", action: "read" },
        { resource: "projects", action: "read" }
      ]}
      requireAll={false} // OR: necesita AL MENOS UNO
      fallback={
        <NoInfoSection message="No tienes permisos para ver los hitos de este proyecto." />
      }
    >
      <div className="flex flex-col gap-2 pl-4">
        {/* Contenido de hitos */}
      </div>
    </PermissionProtected>
  );
};
```

### 11. Ejemplo Real: Botón de Agregar Hito

```tsx
import { PermissionProtected } from "@/shared/components/protected-component";

export const MilestonesProjectPrimaryButtons = () => {
  return (
    <PermissionProtected
      permissions={[
        { resource: "milestones", action: "write" },
        { resource: "milestones", action: "manage" }
      ]}
      requireAll={false} // OR: necesita AL MENOS UNO
      hideOnUnauthorized={true} // Ocultar botón si no tiene permisos
    >
      <Button>Agregar hito</Button>
    </PermissionProtected>
  );
};
```

## Permisos Disponibles

### Recursos (Resources)
- `users`: Gestión de usuarios
- `projects`: Gestión de proyectos
- `clients`: Gestión de clientes
- `milestones`: Gestión de hitos
- `phases`: Gestión de fases
- `deliverables`: Gestión de entregables
- `activities`: Gestión de actividades
- `roles`: Gestión de roles
- `notifications`: Sistema de notificaciones
- `reports`: Generación de reportes
- `dashboard`: Acceso al dashboard
- `resources`: Gestión de recursos
- `system`: Administración del sistema
- `base`: Permisos base universales
- `*`: Wildcard para todos los recursos

### Acciones (Actions)
- `read`: Lectura/visualización
- `write`: Escritura (crear/actualizar)
- `manage`: Gestión completa (CRUD)
- `*`: Wildcard para todas las acciones

## Lógica de Verificación

### Jerarquía de Permisos
1. **Wildcard (`*:*`)**: Acceso total
2. **Manage (`resource:manage`)**: Acceso completo al recurso
3. **Write (`resource:write`)**: Crear y actualizar
4. **Read (`resource:read`)**: Solo lectura

### Estados del Componente
- `LOADING`: Cargando datos del usuario
- `AUTHORIZED`: Usuario autorizado, muestra contenido
- `UNAUTHORIZED`: Usuario no autorizado, muestra fallback

## Mejores Prácticas

1. **Usa componentes especializados** cuando sea posible para mayor claridad
2. **Define fallbacks descriptivos** para mejor UX
3. **Usa `requireAll={false}`** para permisos alternativos (OR)
4. **Usa `requireAll={true}`** para permisos obligatorios (AND)
5. **Combina permisos y roles** para mayor granularidad
6. **Usa exclusión de roles** para casos específicos

## Integración con Backend

El componente utiliza el endpoint `/v1/users/me` para obtener:
- Información del usuario
- Rol asignado
- Permisos del rol
- Estado de autenticación

Los permisos se verifican contra la estructura definida en `authorization-types.ts` del backend.
