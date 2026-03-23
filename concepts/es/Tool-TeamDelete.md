# TeamDelete

## Definición

Elimina un equipo y sus directorios de tareas asociados cuando el trabajo de colaboración multi-agent ha concluido. Es la contrapartida de limpieza de TeamCreate.

## Comportamiento

- Elimina el directorio del equipo: `~/.claude/teams/{team-name}/`
- Elimina el directorio de tareas: `~/.claude/tasks/{team-name}/`
- Limpia el contexto del equipo de la sesión actual

**Importante**: TeamDelete fallará si el equipo todavía tiene miembros activos. Los compañeros de equipo deben cerrarse primero correctamente mediante solicitudes de apagado de SendMessage.

## Uso típico

TeamDelete se llama al final de un flujo de trabajo de equipo:

1. Todas las tareas están completadas
2. Los compañeros de equipo se cierran mediante `SendMessage` con `shutdown_request`
3. **TeamDelete** elimina los directorios del equipo y de tareas

## Herramientas relacionadas

| Herramienta | Propósito |
|-------------|-----------|
| `TeamCreate` | Crear un nuevo equipo y su lista de tareas |
| `SendMessage` | Comunicarse con los compañeros / enviar solicitudes de apagado |
| `TaskCreate` / `TaskUpdate` / `TaskList` / `TaskGet` | Gestionar la lista de tareas compartida |
| `Agent` | Generar compañeros de equipo que se unen al equipo |

## Significado en cc-viewer

Una llamada a TeamDelete señala el fin de una sesión de colaboración multi-agent. Aparece típicamente después de que todos los intercambios de apagado de SendMessage se han completado. En la lista de solicitudes, TeamDelete marca el paso final de limpieza del patrón de equipo.
