# Contenu du Cache KV

## Qu'est-ce que le KV-Cache ?

Le KV-Cache (Key-Value Cache) est un mécanisme d'accélération central lors de l'inférence des grands modèles de langage. Lorsque tu communiques avec Claude, chaque requête envoie l'historique complet de la conversation (prompt système + définitions d'outils + messages historiques). Si ces contenus étaient recalculés à chaque fois, ce serait très coûteux en temps et en ressources.

Le rôle du KV-Cache est de mettre en cache les contenus déjà calculés et de les réutiliser directement lors de la prochaine requête, en évitant les calculs répétés.

## Comment fonctionne le cache

Le prompt caching d'Anthropic concatène les clés de cache dans un ordre fixe :

```
Prompt système → Outils → Messages (jusqu'au point de rupture du cache)
```

Tant que ce préfixe correspond exactement à la requête précédente, l'API atteint le cache (retourne `cache_read_input_tokens`) et réduit considérablement la latence et les coûts.

## Qu'est-ce que le « contenu actuel du cache KV » ?

Le « contenu actuel du cache KV » affiché dans cc-viewer est extrait de la dernière requête MainAgent et marqué comme mis en cache. Il comprend spécifiquement :

- **Prompt système** : Les instructions système de Claude Code, incluant ton CLAUDE.md, la description du projet, les informations d'environnement, etc.
- **Messages** : La partie mise en cache de l'historique de conversation (généralement les messages antérieurs)
- **Outils** : La liste des définitions d'outils actuellement disponibles (comme Read, Write, Bash, outils MCP, etc.)

Ces contenus sont marqués dans le corps de la requête API par `cache_control: { type: "ephemeral" }` pour indiquer les limites du cache.

## Pourquoi consulter le contenu du cache ?

1. **Comprendre le contexte** : Savoir quels contenus Claude « se souvient » actuellement pour mieux évaluer son comportement
2. **Optimisation des coûts** : Les accès au cache coûtent beaucoup moins cher que les recalculs. Consulter le contenu du cache t'aide à comprendre pourquoi certaines requêtes ont déclenché une reconstruction du cache
3. **Débogage de conversation** : Quand les réponses de Claude ne sont pas comme prévu, vérifier le contenu du cache te permet de confirmer que le prompt système et les messages historiques sont corrects
4. **Navigation par instructions utilisateur** : Via la liste des messages utilisateur dans le contenu du cache, tu peux rapidement sauter à n'importe quel point de la conversation
5. **Surveillance de la qualité du contexte** : Lors du débogage quotidien, des modifications des configurations de Claude Code ou des ajustements de prompt, KV-Cache-Text offre une perspective centralisée pour confirmer rapidement que le contexte principal n'a pas été dégradé ou pollué par du contenu inattendu – sans avoir à examiner les messages bruts un par un

## Cycle de vie du cache

- **Création** : Lors de la première requête ou après l'invalidation du cache, l'API crée un nouveau cache (`cache_creation_input_tokens`)
- **Accès** : Lors des requêtes suivantes avec un préfixe cohérent, le cache est réutilisé (`cache_read_input_tokens`)
- **Expiration** : Le cache a une TTL (durée de vie) de 5 minutes et expire automatiquement après ce délai
- **Reconstruction** : Quand le prompt système, la liste des outils, le modèle ou les messages changent, la clé du cache ne correspond plus et déclenche une reconstruction
