# KV-Cache-indhold

## Hvad er KV-Cache?

KV-Cache (Key-Value Cache) er en central accelerationsmekanisme under inferens i store sprogmodeller. Når du chatter med Claude, sender hver anmodning den komplette samtalehistorik (system prompt + værktøjsdefinitioner + tidligere meddelelser). Hvis alt skulle genberegnes fra bunden hver gang, ville det være ekstremt langsomt og dyrt.

KV-Cache's rolle er: at cache-lagre allerede beregnet indhold, så det kan genbruges ved den næste anmodning og springe gentagne beregninger over.

## Hvordan caching fungerer

Anthropics prompt caching sammenkæder cache-nøgler i en fast rækkefølge:

```
System Prompt → Tools → Messages (til cache breakpoint)
```

Så længe dette præfiks er helt identisk med den forrige anmodning, rammer API'en cachen (returnerer `cache_read_input_tokens`), hvilket betydeligt reducerer latens og omkostninger.

## Hvad er "Aktuelt KV-Cache-indhold"?

Det "Aktuelle KV-Cache-indhold" vist i cc-viewer udtrækkes fra den seneste MainAgent-anmodning og markeres som cachelagret indhold. Det omfatter specifikt:

- **System Prompt**: Claude Codes systeminstruktioner, herunder din CLAUDE.md, projektbeskrivelse, miljøinformation osv.
- **Messages**: Den del af samtalehistorikken, der er cachelagret (normalt tidligere meddelelser)
- **Tools**: Listen over tilgængelige værktøjsdefinitioner (såsom Read, Write, Bash, MCP-værktøjer osv.)

Dette indhold markeres i API-anmodningens body gennem `cache_control: { type: "ephemeral" }` for at angive cache-grænser.

## Hvorfor se cache-indholdet?

1. **Forstå konteksten**: Vid hvad Claude i øjeblikket "husker", og hjælp dig selv med at vurdere, om dens adfærd matcher forventningerne
2. **Omkostningsoptimering**: Når cache rammes, er omkostningen meget lavere end genberegning. At se cache-indholdet hjælper dig med at forstå, hvorfor visse anmodninger udløste cache-genopbygning (cache rebuild)
3. **Fejlfinding af samtale**: Når Claudes svar ikke er som forventet, bekræfter kontrol af cache-indholdet, om system prompt og tidligere meddelelser er korrekte
4. **Navigation i brugerinstruktioner**: Gennem listen over brugermeddelelser i cache-indholdet kan du hurtigt springe til ethvert punkt i samtalen
5. **Overvågning af kontekstkvalitet**: Under daglig fejlfinding, ændring af Claude Code-konfiguration eller justering af prompts giver KV-Cache-Text et centraliseret overblik, der hjælper dig med hurtigt at bekræfte, at kernekonteksten ikke er forringet eller forurenet med uventet indhold — uden at skulle gennemgå rå meddelelser én efter én

## Cache-livscyklus

- **Oprettelse**: Ved første anmodning eller efter cache-udløb opretter API'en en ny cache (`cache_creation_input_tokens`)
- **Ramning**: Ved efterfølgende anmodninger med identisk præfiks genbruges cachen (`cache_read_input_tokens`)
- **Udløb**: Cachen har en TTL (time-to-live) på 5 minutter og udløber automatisk efter denne periode
- **Genopbygning**: Når system prompt, værktøjsliste, model eller meddelelser ændres, matcher cache-nøglen ikke, hvilket udløser genopbygning
