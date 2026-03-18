# KV-Cache-innhold

## Hva er KV-Cache?

KV-Cache (Key-Value Cache) er en kjernemekanisme for akselerasjon under inferens i store språkmodeller. Når du chatter med Claude, sendes hele samtalehistorikken (system prompt + verktøydefinisjon + historiske meldinger) med hver forespørsel. Hvis alt måtte beregnes på nytt hver gang, ville det være svært tidkrevende og kostbart.

KV-Caches rolle er: å lagre allerede beregnet innhold i cache, slik at det kan gjenbrukes ved neste forespørsel og gjentatte beregninger hoppes over.

## Hvordan cachen fungerer

Anthropics prompt caching setter sammen cache-nøkler i en fast rekkefølge:

```
System Prompt → Tools → Messages (til cache breakpoint)
```

Så lenge dette prefikset er identisk med forrige forespørsel, vil API-et treffe cachen (returnerer `cache_read_input_tokens`), noe som drastisk reduserer latens og kostnader.

## Hva er "gjeldende KV-Cache-innhold"?

"Gjeldende KV-Cache-innhold" som vises i cc-viewer, er hentet fra den siste MainAgent-forespørselen og merket som cachet innhold. Det inkluderer spesifikt:

- **System Prompt**: Claude Codes systeminstruksjoner, inkludert din CLAUDE.md, prosjektbeskrivelse, miljøinformasjon osv.
- **Messages**: Den cachede delen av samtalehistorikken (vanligvis tidligere meldinger)
- **Tools**: Listen over tilgjengelige verktøydefinisjoner (som Read, Write, Bash, MCP-verktøy osv.)

Dette innholdet merkes i API-forespørselens body gjennom `cache_control: { type: "ephemeral" }` for å indikere cache-grensen.

## Hvorfor se på cache-innholdet?

1. **Forstå konteksten**: Vit hvilket innhold Claude for øyeblikket "husker", og hjelp deg selv med å vurdere om atferden er som forventet
2. **Kostnadsoptimalisering**: Cache-treff koster langt mindre enn omberegning. Å se cache-innholdet hjelper deg med å forstå hvorfor visse forespørsler utløste cache-gjenoppbygging (cache rebuild)
3. **Feilsøking av samtale**: Når Claudes svar ikke er som forventet, kan du sjekke cache-innholdet for å bekrefte at system prompt og historiske meldinger er korrekte
4. **Navigering i brukerinstruksjoner**: Gjennom listen over brukermeldinger i cache-innholdet kan du raskt hoppe til hvilken som helst posisjon i samtalen
5. **Overvåking av kontekstkvalitet**: Under daglig feilsøking, endring av Claude Code-konfigurasjon eller justering av prompts, gir KV-Cache-Text et sentralisert perspektiv som hjelper deg med å raskt bekrefte at kjernekonteksten ikke har forverret seg eller blitt forurenset av uventet innhold — uten å måtte gjennomgå originale meldinger én etter én

## Cache-livssyklus

- **Opprettelse**: Ved første forespørsel eller etter at cache-en er utløpt, oppretter API-et en ny cache (`cache_creation_input_tokens`)
- **Treff**: Når påfølgende forespørsler har konsistent prefiks, gjenbrukes cachen (`cache_read_input_tokens`)
- **Utløp**: Cachen har en TTL (levetid) på 5 minutter og utløper automatisk etter dette
- **Gjenoppbygging**: Når system prompt, verktøyliste, modell eller meldinger endres, samsvarer ikke cache-nøkkelen, noe som utløser gjenoppbygging
