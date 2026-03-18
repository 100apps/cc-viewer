# Contenido de la Caché KV

## ¿Qué es KV-Cache?

KV-Cache (Key-Value Cache) es un mecanismo de aceleración central en la inferencia de grandes modelos de lenguaje. Cuando te comunicas con Claude, cada solicitud envía el historial completo de la conversación (prompt del sistema + definiciones de herramientas + mensajes históricos). Si estos contenidos se recalcularan cada vez, sería muy costoso en tiempo y recursos.

El propósito de KV-Cache es almacenar en caché los contenidos ya calculados y reutilizarlos directamente en la siguiente solicitud, evitando cálculos repetidos.

## Cómo funciona la caché

El almacenamiento en caché de prompts de Anthropic concatena las claves de caché en un orden fijo:

```
Prompt del sistema → Herramientas → Mensajes (hasta el punto de ruptura de caché)
```

Mientras este prefijo coincida exactamente con la solicitud anterior, la API accede a la caché (devuelve `cache_read_input_tokens`) y reduce significativamente la latencia y los costos.

## ¿Qué es el «contenido actual de la caché KV»?

El «contenido actual de la caché KV» mostrado en cc-viewer se extrae de la última solicitud de MainAgent y se marca como almacenado en caché. Incluye específicamente:

- **Prompt del sistema**: Las instrucciones del sistema de Claude Code, incluyendo tu CLAUDE.md, descripción del proyecto, información del entorno, etc.
- **Mensajes**: La parte del historial de conversación que está almacenada en caché (generalmente mensajes anteriores)
- **Herramientas**: La lista de definiciones de herramientas actualmente disponibles (como Read, Write, Bash, herramientas MCP, etc.)

Estos contenidos se marcan en el cuerpo de la solicitud de API mediante `cache_control: { type: "ephemeral" }` para indicar los límites de la caché.

## ¿Por qué consultar el contenido de la caché?

1. **Entender el contexto**: Saber qué contenidos «recuerda» Claude actualmente para evaluar mejor su comportamiento
2. **Optimización de costos**: Los accesos a caché cuestan mucho menos que los recálculos. Consultar el contenido de la caché te ayuda a entender por qué ciertas solicitudes desencadenaron una reconstrucción de caché
3. **Depuración de conversación**: Cuando las respuestas de Claude no son las esperadas, verificar el contenido de la caché te permite confirmar que el prompt del sistema y los mensajes históricos son correctos
4. **Navegación por instrucciones del usuario**: A través de la lista de mensajes del usuario en el contenido de la caché, puedes saltar rápidamente a cualquier punto de la conversación
5. **Monitoreo de la calidad del contexto**: Durante la depuración diaria, cambios en las configuraciones de Claude Code o ajustes de prompts, KV-Cache-Text proporciona una perspectiva centralizada para confirmar rápidamente que el contexto principal no se ha degradado o contaminado con contenido inesperado – sin necesidad de revisar los mensajes brutos uno por uno

## Ciclo de vida de la caché

- **Creación**: En la primera solicitud o después de la invalidación de caché, la API crea una nueva caché (`cache_creation_input_tokens`)
- **Acceso**: En solicitudes posteriores con un prefijo consistente, se reutiliza la caché (`cache_read_input_tokens`)
- **Expiración**: La caché tiene un TTL (tiempo de vida) de 5 minutos y expira automáticamente después de ese tiempo
- **Reconstrucción**: Cuando el prompt del sistema, la lista de herramientas, el modelo o los mensajes cambian, la clave de caché no coincide y desencadena una reconstrucción
