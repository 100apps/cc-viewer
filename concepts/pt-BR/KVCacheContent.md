# Conteúdo do KV-Cache

## O que é KV-Cache?

KV-Cache (Key-Value Cache) é um mecanismo central de aceleração durante a inferência de grandes modelos de linguagem. Quando você conversa com Claude, cada requisição envia o histórico completo da conversa (system prompt + definições de ferramentas + mensagens anteriores). Se tudo fosse recalculado do zero a cada vez, seria extremamente demorado e caro.

O papel do KV-Cache é: armazenar em cache o conteúdo já calculado, reutilizando-o na próxima requisição e pulando cálculos repetidos.

## Como o cache funciona

O prompt caching da Anthropic concatena as chaves de cache em uma ordem fixa:

```
System Prompt → Tools → Messages (até o cache breakpoint)
```

Enquanto esse prefixo for idêntico ao da requisição anterior, a API acerta o cache (retornando `cache_read_input_tokens`), reduzindo significativamente a latência e o custo.

## O que é o "conteúdo atual do KV-Cache"?

O "conteúdo atual do KV-Cache" exibido no cc-viewer é extraído da requisição mais recente do MainAgent e marcado como conteúdo em cache. Inclui especificamente:

- **System Prompt**: As instruções do sistema do Claude Code, incluindo seu CLAUDE.md, descrição do projeto, informações do ambiente, etc.
- **Messages**: A parte do histórico de conversa que está em cache (geralmente mensagens mais antigas)
- **Tools**: A lista de definições de ferramentas disponíveis (como Read, Write, Bash, ferramentas MCP, etc.)

Esse conteúdo é marcado no body da requisição da API através de `cache_control: { type: "ephemeral" }` para indicar os limites do cache.

## Por que visualizar o conteúdo do cache?

1. **Entender o contexto**: Saiba qual conteúdo Claude "lembra" atualmente, ajudando a determinar se seu comportamento está de acordo com o esperado
2. **Otimização de custos**: O custo quando o cache é acertado é muito menor do que recalcular. Visualizar o conteúdo do cache ajuda a entender por que certas requisições acionaram uma reconstrução do cache (cache rebuild)
3. **Depuração de conversa**: Quando a resposta do Claude não é a esperada, verificar o conteúdo do cache confirma se o system prompt e as mensagens anteriores estão corretos
4. **Navegação de instruções do usuário**: Através da lista de mensagens do usuário no conteúdo do cache, você pode pular rapidamente para qualquer ponto da conversa
5. **Monitoramento da qualidade do contexto**: Durante a depuração diária, modificação de configurações do Claude Code ou ajuste de prompts, o KV-Cache-Text oferece uma visão centralizada, ajudando a confirmar rapidamente se o contexto principal sofreu degradação ou foi contaminado por conteúdo inesperado — sem precisar revisar as mensagens brutas uma a uma

## Ciclo de vida do cache

- **Criação**: Na primeira requisição ou após invalidação do cache, a API cria um novo cache (`cache_creation_input_tokens`)
- **Acerto**: Quando requisições subsequentes têm prefixo idêntico, o cache é reutilizado (`cache_read_input_tokens`)
- **Expiração**: O cache tem um TTL (tempo de vida) de 5 minutos e expira automaticamente após esse período
- **Reconstrução**: Quando o system prompt, lista de ferramentas, modelo ou mensagens mudam, a chave de cache não corresponde, acionando uma reconstrução
