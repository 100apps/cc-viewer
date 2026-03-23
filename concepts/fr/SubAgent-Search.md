# SubAgent: Search

## Définition

Search est un type de sous-agent lancé par l'agent principal de Claude Code pour effectuer des recherches dans le code source. Il exécute des recherches ciblées de fichiers et de contenu à l'aide d'outils tels que Glob, Grep et Read, puis renvoie les résultats à l'agent parent.

## Comportement

- Lancé automatiquement lorsque l'agent principal doit rechercher ou explorer le code source
- S'exécute dans un contexte isolé avec un accès en lecture seule
- Utilise Glob pour la correspondance de motifs de fichiers, Grep pour la recherche de contenu et Read pour l'inspection de fichiers
- Renvoie les résultats de recherche à l'agent parent pour un traitement ultérieur

## Quand il apparaît

Les sous-agents Search apparaissent généralement lorsque :

1. L'agent principal doit trouver des fichiers, des fonctions ou des motifs de code spécifiques
2. L'utilisateur demande une exploration large du code source
3. L'agent examine des dépendances, des références ou des patterns d'utilisation

## Signification dans cc-viewer

Dans la chronologie des requêtes, les sous-agents Search apparaissent sous forme de chaînes de requêtes imbriquées sous la requête de l'agent parent. Plusieurs sous-agents Search peuvent s'exécuter en parallèle lorsque l'agent explore simultanément différentes parties du code source. La section des statistiques SubAgent comptabilise le nombre d'opérations Search effectuées au cours d'une session.
