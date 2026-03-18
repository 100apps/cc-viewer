# KV-Cache-Inhalte

## Was ist KV-Cache?

KV-Cache (Key-Value Cache) ist ein zentraler Beschleunigungsmechanismus beim Inferenzprozess großer Sprachmodelle. Wenn du mit Claude kommunizierst, wird bei jeder Anfrage die vollständige Gesprächshistorie gesendet (System Prompt + Tool-Definitionen + historische Nachrichten). Wenn diese Inhalte jedes Mal von Grund auf neu berechnet würden, wäre das sehr zeitaufwändig und teuer.

Die Funktion von KV-Cache besteht darin, bereits berechnete Inhalte zu speichern und bei der nächsten Anfrage direkt wiederzuverwenden, um wiederholte Berechnungen zu vermeiden.

## Wie der Cache funktioniert

Anthropics Prompt Caching verkettet Cache-Schlüssel in einer festen Reihenfolge:

```
System Prompt → Tools → Messages (bis zum Cache-Breakpoint)
```

Solange dieses Präfix mit der vorherigen Anfrage vollständig übereinstimmt, trifft die API den Cache (gibt `cache_read_input_tokens` zurück) und reduziert Latenz und Kosten erheblich.

## Was ist „aktueller KV-Cache-Inhalt"?

Der in cc-viewer angezeigte „aktuelle KV-Cache-Inhalt" wird aus der letzten MainAgent-Anfrage extrahiert und als gecacht markiert. Dies umfasst speziell:

- **System Prompt**: Die Systeminstruktionen von Claude Code, einschließlich deiner CLAUDE.md, Projektbeschreibung, Umgebungsinformationen usw.
- **Messages**: Der gecachte Teil der Gesprächshistorie (normalerweise frühere Nachrichten)
- **Tools**: Die Liste der aktuell verfügbaren Tool-Definitionen (wie Read, Write, Bash, MCP-Tools usw.)

Diese Inhalte werden im Body der API-Anfrage durch `cache_control: { type: "ephemeral" }` gekennzeichnet, um die Cache-Grenzen anzuzeigen.

## Warum sollte man Cache-Inhalte ansehen?

1. **Kontext verstehen**: Erfahre, welche Inhalte Claude derzeit „merkt", um sein Verhalten besser einschätzen zu können
2. **Kostenoptimierung**: Cache-Treffer sind deutlich günstiger als Neuberechnungen. Das Ansehen von Cache-Inhalten hilft dir zu verstehen, warum bestimmte Anfragen einen Cache-Rebuild ausgelöst haben
3. **Gesprächs-Debugging**: Wenn Claudes Antworten nicht wie erwartet ausfallen, kannst du durch Überprüfung der Cache-Inhalte bestätigen, dass System Prompt und historische Nachrichten korrekt sind
4. **Navigation durch Benutzeranweisungen**: Über die Liste der Benutzernachrichten in den Cache-Inhalten kannst du schnell zu jeder Position im Gespräch springen
5. **Überwachung der Kontextqualität**: Bei täglichem Debugging, Änderungen an Claude Code-Konfigurationen oder Prompt-Anpassungen bietet KV-Cache-Text eine zentrale Perspektive, um schnell zu bestätigen, dass der Kernkontext nicht beeinträchtigt wurde oder durch unerwartete Inhalte verschmutzt wurde – ohne rohe Nachrichten einzeln durchzusehen

## Lebenszyklus des Cache

- **Erstellung**: Bei der ersten Anfrage oder nach Cache-Ungültigkeit erstellt die API einen neuen Cache (`cache_creation_input_tokens`)
- **Treffer**: Bei nachfolgenden Anfragen mit konsistentem Präfix wird der Cache wiederverwendet (`cache_read_input_tokens`)
- **Ablauf**: Der Cache hat eine TTL (Time To Live) von 5 Minuten und verfällt automatisch nach Ablauf
- **Rebuild**: Wenn sich System Prompt, Tool-Liste, Modell oder Nachrichten ändern, stimmt der Cache-Schlüssel nicht überein und löst einen Rebuild aus
