# SubAgent: Search

## Definizione

Search è un tipo di sotto-agente avviato dall'agente principale di Claude Code per eseguire ricerche nel codice sorgente. Esegue ricerche mirate di file e contenuto utilizzando strumenti come Glob, Grep e Read, quindi restituisce i risultati all'agente padre.

## Comportamento

- Avviato automaticamente quando l'agente principale deve cercare o esplorare il codice sorgente
- Viene eseguito in un contesto isolato con accesso in sola lettura
- Usa Glob per la corrispondenza di pattern di file, Grep per la ricerca di contenuto e Read per l'ispezione di file
- Restituisce i risultati della ricerca all'agente padre per ulteriore elaborazione

## Quando appare

I sotto-agenti Search appaiono tipicamente quando:

1. L'agente principale deve trovare file, funzioni o pattern di codice specifici
2. L'utente richiede un'esplorazione ampia del codice sorgente
3. L'agente sta esaminando dipendenze, riferimenti o pattern di utilizzo

## Significato in cc-viewer

Nella cronologia delle richieste, i sotto-agenti Search appaiono come catene di richieste annidate sotto la richiesta dell'agente padre. Più sotto-agenti Search possono essere eseguiti in parallelo quando l'agente esplora simultaneamente diverse parti del codice sorgente. La sezione delle statistiche SubAgent conta quante operazioni Search sono state eseguite durante una sessione.
