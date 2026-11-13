# Locais de eventos em Palmas - TO

Catálogo de salões, chácaras e espaços para eventos em Palmas, com valores e suas condições, localização, Instagram, WhatsApp, horários, fotos e observações. Também registra visitas: situação, nota por critério, prós, contras, orçamento recebido e anotações, e compara até 4 locais lado a lado.

Site: https://geisbelly.github.io/locais-eventos-palmas/

Sem login para ver. Para gravar visitas e **cadastrar ou editar locais** pelo site é preciso digitar uma vez a **chave de edição** (ícone de nuvem).

## Onde ficam os dados

| O quê | Onde | Custo |
|---|---|---|
| Locais (nome, preços, contato…) | `data/locais.json` neste repositório | R$ 0 |
| Locais cadastrados ou editados pelo site | Cloudflare D1 (tabela `locais`). Vale a versão mais nova entre o banco e o JSON | R$ 0 |
| Visitas, prós, contras, anotações | Cloudflare D1 via Worker (pasta `worker/`) | R$ 0 no plano gratuito (5 GB, 100 mil gravações/dia) |
| Sem Worker configurado | `localStorage` do navegador + backup em arquivo | R$ 0 |

## Adicionar ou corrigir um local

Pelo site: botão **+ Cadastrar** no topo, ou **Editar** (lápis) dentro de um local. O formulário tem o que vem no aluguel (piscina, mesas e cadeiras com quantidade, churrasqueira, limpeza…), valores com condição, taxas, horários, contato e fotos. **Remover** só esconde o local da lista.

Ou edite `data/locais.json` direto. O que vem fica em `itens` (`true` ou a quantidade):

```json
"itens": { "piscina": true, "mesas": 20, "cadeiras": 80, "limpeza": true }
```

Cada preço leva a condição:

```json
"precos": [
  { "valor": 400, "unidade": "diária", "condicao": "Segunda a quinta", "inclui": "Piscina e churrasqueira" },
  { "valor": 600, "unidade": "diária", "condicao": "Sexta a domingo", "inclui": "Piscina e churrasqueira" }
]
```

Outros campos: `horarios` (`[{ "dias": "Sáb e dom", "horario": "8h às 2h" }]`), `fotos` (`[{ "url": "fotos/orla-1.jpg", "legenda": "Píer" }]`, com as imagens na pasta `fotos/`), `coordenadas` (`{ "lat": -10.18, "lng": -48.33 }`), `fontes` e `conferido_em`.

## Ligar a nuvem (Cloudflare, gratuito)

Uma vez só, no terminal, dentro de `worker/`:

```bash
npm install
npx wrangler login
npx wrangler d1 create locais-eventos-palmas
```

Cole o `database_id` que aparecer em `worker/wrangler.toml`, depois:

```bash
npx wrangler d1 execute locais-eventos-palmas --remote --file schema.sql
npx wrangler secret put CHAVE_EDICAO
npx wrangler deploy
```

Copie a URL `https://locais-eventos-palmas-api.<sua-conta>.workers.dev` para `apiUrl` em `config.js`, faça commit e push. No site, clique no ícone de nuvem e digite a chave.

## Rodar local

```bash
python3 -m http.server 8080
```
