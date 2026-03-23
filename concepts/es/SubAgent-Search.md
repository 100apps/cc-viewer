# SubAgent: Search

## Definición

Search es un tipo de sub-agente generado por el agente principal de Claude Code para realizar búsquedas en el código fuente. Ejecuta búsquedas dirigidas de archivos y contenido usando herramientas como Glob, Grep y Read, y luego devuelve los resultados al agente padre.

## Comportamiento

- Se genera automáticamente cuando el agente principal necesita buscar o explorar el código fuente
- Se ejecuta en un contexto aislado con acceso de solo lectura
- Usa Glob para coincidencia de patrones de archivos, Grep para búsqueda de contenido y Read para inspección de archivos
- Devuelve los resultados de búsqueda al agente padre para su posterior procesamiento

## Cuando aparece

Los sub-agentes Search aparecen típicamente cuando:

1. El agente principal necesita encontrar archivos, funciones o patrones de código específicos
2. El usuario solicita una exploración amplia del código fuente
3. El agente investiga dependencias, referencias o patrones de uso

## Significado en cc-viewer

En la línea de tiempo de solicitudes, los sub-agentes Search aparecen como cadenas de solicitudes anidadas bajo la solicitud del agente padre. Múltiples sub-agentes Search pueden ejecutarse en paralelo cuando el agente explora diferentes partes del código fuente simultáneamente. La sección de estadísticas de SubAgent contabiliza cuántas operaciones Search se realizaron durante una sesión.
