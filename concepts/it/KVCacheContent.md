# Contenuto della Cache KV

## Cos'è KV-Cache?

KV-Cache (Key-Value Cache) è un meccanismo di accelerazione centrale durante l'inferenza dei grandi modelli di linguaggio. Quando comunichi con Claude, ogni richiesta invia la cronologia completa della conversazione (prompt di sistema + definizioni degli strumenti + messaggi storici). Se questi contenuti venissero ricalcolati ogni volta, sarebbe molto costoso in termini di tempo e risorse.

Lo scopo di KV-Cache è memorizzare nella cache i contenuti già calcolati e riutilizzarli direttamente nella richiesta successiva, evitando calcoli ripetuti.

## Come funziona la cache

Il prompt caching di Anthropic concatena le chiavi della cache in un ordine fisso:

```
Prompt di sistema → Strumenti → Messaggi (fino al punto di interruzione della cache)
```

Finché questo prefisso corrisponde esattamente alla richiesta precedente, l'API accede alla cache (restituisce `cache_read_input_tokens`) e riduce significativamente la latenza e i costi.

## Cos'è il «contenuto attuale della cache KV»?

Il «contenuto attuale della cache KV» visualizzato in cc-viewer viene estratto dall'ultima richiesta di MainAgent e contrassegnato come memorizzato nella cache. Include specificamente:

- **Prompt di sistema**: Le istruzioni di sistema di Claude Code, inclusi il tuo CLAUDE.md, la descrizione del progetto, le informazioni sull'ambiente, ecc.
- **Messaggi**: La parte della cronologia della conversazione memorizzata nella cache (generalmente messaggi precedenti)
- **Strumenti**: L'elenco delle definizioni degli strumenti attualmente disponibili (come Read, Write, Bash, strumenti MCP, ecc.)

Questi contenuti sono contrassegnati nel corpo della richiesta API mediante `cache_control: { type: "ephemeral" }` per indicare i limiti della cache.

## Perché consultare il contenuto della cache?

1. **Comprendere il contesto**: Sapere quali contenuti Claude «ricorda» attualmente per valutare meglio il suo comportamento
2. **Ottimizzazione dei costi**: Gli accessi alla cache costano molto meno dei ricalcoli. Consultare il contenuto della cache ti aiuta a capire perché certe richieste hanno attivato una ricostruzione della cache
3. **Debug della conversazione**: Quando le risposte di Claude non sono come previsto, verificare il contenuto della cache ti consente di confermare che il prompt di sistema e i messaggi storici sono corretti
4. **Navigazione per istruzioni dell'utente**: Attraverso l'elenco dei messaggi dell'utente nel contenuto della cache, puoi saltare rapidamente a qualsiasi punto della conversazione
5. **Monitoraggio della qualità del contesto**: Durante il debug quotidiano, i cambiamenti nelle configurazioni di Claude Code o gli aggiustamenti dei prompt, KV-Cache-Text fornisce una prospettiva centralizzata per confermare rapidamente che il contesto principale non è stato degradato o contaminato da contenuti inaspettati – senza dover esaminare i messaggi grezzi uno per uno

## Ciclo di vita della cache

- **Creazione**: Alla prima richiesta o dopo l'invalidazione della cache, l'API crea una nuova cache (`cache_creation_input_tokens`)
- **Accesso**: Nelle richieste successive con un prefisso coerente, la cache viene riutilizzata (`cache_read_input_tokens`)
- **Scadenza**: La cache ha un TTL (time to live) di 5 minuti e scade automaticamente dopo tale periodo
- **Ricostruzione**: Quando il prompt di sistema, l'elenco degli strumenti, il modello o i messaggi cambiano, la chiave della cache non corrisponde e attiva una ricostruzione
