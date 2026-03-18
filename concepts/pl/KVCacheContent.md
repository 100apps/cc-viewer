# Zawartość KV-Cache

## Czym jest KV-Cache?

KV-Cache (Key-Value Cache) to kluczowy mechanizm przyspieszenia podczas wnioskowania w dużych modelach językowych. Gdy rozmawiasz z Claude, każde żądanie wysyła pełną historię konwersacji (system prompt + definicje narzędzi + historyczne wiadomości). Gdyby wszystko musiało być obliczane od nowa za każdym razem, byłoby to bardzo czasochłonne i kosztowne.

Rola KV-Cache polega na: przechowywaniu już obliczonej zawartości w pamięci podręcznej, aby mogła być ponownie wykorzystana przy następnym żądaniu, omijając powtórne obliczenia.

## Jak działa pamięć podręczna

Prompt caching Anthropica łączy klucze pamięci podręcznej w stałej kolejności:

```
System Prompt → Tools → Messages (do cache breakpoint)
```

Dopóki ten prefiks jest identyczny z poprzednim żądaniem, API trafi w pamięć podręczną (zwraca `cache_read_input_tokens`), drastycznie zmniejszając opóźnienie i koszty.

## Czym jest "bieżąca zawartość KV-Cache"?

"Bieżąca zawartość KV-Cache" wyświetlana w cc-viewer to zawartość wyodrębniona z ostatniego żądania MainAgent i oznaczona jako buforowana. Obejmuje konkretnie:

- **System Prompt**: Instrukcje systemowe Claude Code, w tym twój CLAUDE.md, opis projektu, informacje o środowisku itp.
- **Messages**: Buforowana część historii konwersacji (zwykle wcześniejsze wiadomości)
- **Tools**: Lista dostępnych definicji narzędzi (takich jak Read, Write, Bash, narzędzia MCP itp.)

Ta zawartość jest oznaczona w treści żądania API za pomocą `cache_control: { type: "ephemeral" }` w celu wskazania granicy pamięci podręcznej.

## Dlaczego warto przeglądać zawartość pamięci podręcznej?

1. **Zrozumienie kontekstu**: Wiedz, jaką zawartość Claude aktualnie "pamięta", i pomóż sobie ocenić, czy zachowanie jest zgodne z oczekiwaniami
2. **Optymalizacja kosztów**: Trafienie w pamięć podręczną kosztuje znacznie mniej niż ponowne obliczenia. Przeglądanie zawartości pamięci podręcznej pomaga zrozumieć, dlaczego niektóre żądania wyzwoliły przebudowę pamięci podręcznej (cache rebuild)
3. **Debugowanie konwersacji**: Gdy odpowiedź Claude nie jest zgodna z oczekiwaniami, sprawdzenie zawartości pamięci podręcznej potwierdza, czy system prompt i historyczne wiadomości są poprawne
4. **Nawigacja instrukcji użytkownika**: Poprzez listę wiadomości użytkownika w zawartości pamięci podręcznej, możesz szybko przejść do dowolnego miejsca w konwersacji
5. **Monitorowanie jakości kontekstu**: Podczas codziennego debugowania, zmiany konfiguracji Claude Code lub dostosowywania promptów, KV-Cache-Text zapewnia scentralizowaną perspektywę, która pomaga szybko potwierdzić, że kontekst główny nie uległ pogorszeniu lub nie został zanieczyszczony nieoczekiwaną zawartością — bez konieczności przeglądania oryginalnych wiadomości po kolei

## Cykl życia pamięci podręcznej

- **Tworzenie**: Przy pierwszym żądaniu lub po utracie ważności pamięci podręcznej, API tworzy nową pamięć podręczną (`cache_creation_input_tokens`)
- **Trafienie**: Gdy kolejne żądania mają spójny prefiks, pamięć podręczna jest ponownie wykorzystywana (`cache_read_input_tokens`)
- **Wygaśnięcie**: Pamięć podręczna ma TTL (czas życia) wynoszący 5 minut i automatycznie wygasa po upływie tego czasu
- **Przebudowa**: Gdy system prompt, lista narzędzi, model lub wiadomości się zmienią, klucz pamięci podręcznej nie pasuje, wyzwalając przebudowę
