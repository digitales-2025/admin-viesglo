# ProjectContext - Solución para Evitar Llamadas Duplicadas

## 🎯 Problema Resuelto

Antes tenías llamadas duplicadas a `useProjectById(projectId)` en:
- `layout.tsx` - Para mostrar información del proyecto en el sidebar
- `ListObjectives.tsx` - Para mostrar los milestones del proyecto

## ✅ Solución Implementada

### 1. **ProjectProvider** - Context Provider
- Centraliza la llamada a `useProjectById(projectId)` una sola vez
- Comparte los datos con todos los componentes hijos
- Evita llamadas duplicadas al mismo endpoint

### 2. **useProjectContext** - Hook Personalizado
- Proporciona acceso a los datos del proyecto desde cualquier componente hijo
- Incluye: `projectData`, `isLoading`, `error`, `refetch`

## 🏗️ Arquitectura

```
TrackingLayout (ProjectProvider)
├── CurrentProjectTree (useProjectContext)
├── ListObjectives (useProjectContext)
└── Otros componentes hijos
```

## 📝 Uso

### En el Layout (ya implementado):
```tsx
export default function TrackingLayout({ children }) {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <ProjectProvider projectId={projectId}>
      <TrackingLayoutContent>{children}</TrackingLayoutContent>
    </ProjectProvider>
  );
}
```

### En cualquier componente hijo:
```tsx
import { useProjectContext } from "./_context/ProjectContext";

function MyComponent() {
  const { projectData, isLoading, error, refetch } = useProjectContext();
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{projectData?.name}</div>;
}
```

## 🚀 Beneficios

1. **Performance**: Una sola llamada HTTP en lugar de múltiples
2. **Consistencia**: Todos los componentes ven los mismos datos
3. **Mantenibilidad**: Cambios centralizados en un solo lugar
4. **Caching**: React Query maneja el cache automáticamente
5. **Error Handling**: Manejo centralizado de errores

## 🔄 Flujo de Datos

1. `ProjectProvider` hace la llamada inicial con `useProjectById(projectId)`
2. Los datos se almacenan en el Context
3. Cualquier componente hijo puede acceder con `useProjectContext()`
4. React Query maneja el cache y revalidación automáticamente

## ⚠️ Consideraciones

- El `ProjectProvider` debe envolver todos los componentes que necesiten acceso a los datos del proyecto
- Si necesitas datos de otros proyectos, deberías crear providers separados
- El context se reinicia cuando cambia el `projectId`
