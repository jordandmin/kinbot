# KinBot — Structure du projet

Monorepo avec frontend et backend dans le même dépôt, servis par un seul process Bun.

---

## Arborescence

```
kinbot/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── src/
│   ├── server/                     # Backend (Bun + Hono)
│   │   ├── index.ts                # Point d'entrée : Hono app + serve static
│   │   ├── app.ts                  # Configuration Hono (middleware, routes)
│   │   │
│   │   ├── routes/                 # Routes API REST
│   │   │   ├── auth.ts             # POST /api/auth/*
│   │   │   ├── me.ts               # GET/PATCH /api/me
│   │   │   ├── kins.ts             # CRUD /api/kins
│   │   │   ├── messages.ts         # POST /api/kins/:id/messages
│   │   │   ├── providers.ts        # CRUD /api/providers
│   │   │   ├── tasks.ts            # GET /api/tasks
│   │   │   ├── crons.ts            # CRUD /api/crons
│   │   │   ├── mcp-servers.ts      # CRUD /api/mcp-servers
│   │   │   ├── vault.ts            # CRUD /api/vault
│   │   │   ├── files.ts            # POST /api/files/upload
│   │   │   └── sse.ts              # GET /api/sse (connexion SSE globale)
│   │   │
│   │   ├── services/               # Logique métier
│   │   │   ├── kin-engine.ts       # Orchestration LLM : construction du contexte, appels, streaming
│   │   │   ├── prompt-builder.ts   # Construction du prompt système d'un Kin
│   │   │   ├── queue.ts            # Queue FIFO par Kin (enqueue, dequeue, priorité)
│   │   │   ├── compacting.ts       # Compacting des sessions (résumé, snapshots, rollback)
│   │   │   ├── memory.ts           # Mémoire long terme (extraction, recall, memorize, search hybride)
│   │   │   ├── embeddings.ts       # Génération d'embeddings via provider
│   │   │   ├── contacts.ts         # CRUD contacts + injection résumé compact
│   │   │   ├── tasks.ts            # Cycle de vie des tâches (spawn, status, résolution)
│   │   │   ├── crons.ts            # Scheduler (croner) + spawn des sous-Kins
│   │   │   ├── inter-kin.ts        # Communication inter-Kins (send_message, reply, garde-fous)
│   │   │   ├── vault.ts            # Gestion des secrets (chiffrement, get_secret, redact)
│   │   │   ├── files.ts            # Upload, stockage, référencement des fichiers
│   │   │   └── events.ts           # Event bus (emit, on, listeners)
│   │   │
│   │   ├── providers/              # Implémentations des providers IA
│   │   │   ├── index.ts            # Registry des providers + résolution par capacité
│   │   │   ├── types.ts            # Interfaces (ProviderConfig, LLMCapability, etc.)
│   │   │   ├── anthropic.ts        # Implémentation Anthropic
│   │   │   ├── openai.ts           # Implémentation OpenAI
│   │   │   ├── gemini.ts           # Implémentation Gemini
│   │   │   └── voyage.ts           # Implémentation Voyage AI
│   │   │
│   │   ├── tools/                  # Outils natifs exposés aux Kins
│   │   │   ├── index.ts            # Registry de tous les outils + résolution par contexte
│   │   │   ├── types.ts            # Types communs (ToolDefinition, ToolResult)
│   │   │   ├── memory-tools.ts     # recall, memorize, update_memory, forget, list_memories
│   │   │   ├── contact-tools.ts    # get_contact, search_contacts, create_contact, update_contact
│   │   │   ├── history-tools.ts    # search_history
│   │   │   ├── inter-kin-tools.ts  # send_message, reply, list_kins
│   │   │   ├── task-tools.ts       # spawn_self, spawn_kin, respond_to_task, cancel_task, list_tasks
│   │   │   ├── subtask-tools.ts    # report_to_parent, update_task_status, request_input
│   │   │   ├── cron-tools.ts       # create_cron, update_cron, delete_cron, list_crons
│   │   │   ├── vault-tools.ts      # get_secret, redact_message
│   │   │   ├── custom-tool-tools.ts # register_tool, run_custom_tool, list_custom_tools
│   │   │   └── image-tools.ts      # generate_image
│   │   │
│   │   ├── db/                     # Base de données
│   │   │   ├── index.ts            # Connexion SQLite (bun:sqlite) + extensions (sqlite-vec, FTS5)
│   │   │   ├── schema.ts           # Schéma Drizzle (toutes les tables)
│   │   │   ├── migrations/         # Migrations Drizzle
│   │   │   └── seed.ts             # Seed de développement (optionnel)
│   │   │
│   │   ├── auth/                   # Authentification
│   │   │   ├── index.ts            # Configuration Better Auth
│   │   │   └── middleware.ts       # Hono middleware (vérification session)
│   │   │
│   │   ├── hooks/                  # Hooks du cycle de vie
│   │   │   ├── index.ts            # Registry des hooks + exécution
│   │   │   └── types.ts            # Types (HookContext, HookHandler)
│   │   │
│   │   ├── sse/                    # Server-Sent Events
│   │   │   ├── index.ts            # Gestionnaire SSE (connexions, broadcast)
│   │   │   └── types.ts            # Types d'événements SSE
│   │   │
│   │   └── config.ts              # Configuration centralisée (valeurs par défaut, env vars)
│   │
│   ├── client/                     # Frontend (React + Vite)
│   │   ├── main.tsx                # Point d'entrée React
│   │   ├── App.tsx                 # Router principal
│   │   │
│   │   ├── pages/                  # Pages / vues
│   │   │   ├── onboarding/         # Wizard d'onboarding
│   │   │   │   ├── OnboardingPage.tsx
│   │   │   │   ├── StepIdentity.tsx
│   │   │   │   └── StepProviders.tsx
│   │   │   ├── chat/               # Vue principale (sidebar + chat)
│   │   │   │   └── ChatPage.tsx
│   │   │   ├── settings/           # Pages settings
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── ProvidersSettings.tsx
│   │   │   │   ├── McpSettings.tsx
│   │   │   │   └── VaultSettings.tsx
│   │   │   ├── account/            # Mon compte
│   │   │   │   └── AccountPage.tsx
│   │   │   └── login/
│   │   │       └── LoginPage.tsx
│   │   │
│   │   ├── components/             # Composants réutilisables
│   │   │   ├── ui/                 # shadcn/ui (boutons, inputs, dialogs, etc.)
│   │   │   ├── sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── KinList.tsx
│   │   │   │   └── TaskList.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   │   ├── kin/
│   │   │   │   ├── KinCard.tsx
│   │   │   │   ├── KinCreateModal.tsx
│   │   │   │   └── KinSettingsModal.tsx
│   │   │   └── common/
│   │   │       ├── Avatar.tsx
│   │   │       └── Badge.tsx
│   │   │
│   │   ├── hooks/                  # React hooks custom
│   │   │   ├── useAuth.ts
│   │   │   ├── useKins.ts
│   │   │   ├── useChat.ts          # Wrapper autour de useChat du Vercel AI SDK
│   │   │   ├── useSSE.ts           # Gestion de la connexion SSE globale
│   │   │   └── useTasks.ts
│   │   │
│   │   ├── lib/                    # Utilitaires client
│   │   │   ├── api.ts              # Client API (fetch wrapper avec auth cookie)
│   │   │   ├── i18n.ts             # Configuration i18next (init, détection langue)
│   │   │   └── utils.ts            # Fonctions utilitaires
│   │   │
│   │   ├── locales/                # Traductions i18n
│   │   │   ├── en.json             # Anglais (langue de base)
│   │   │   └── fr.json             # Français
│   │   │
│   │   └── styles/
│   │       └── globals.css         # Tailwind base + custom properties (design tokens)
│   │
│   └── shared/                     # Code partagé frontend/backend
│       ├── types.ts                # Types communs (Kin, Message, Task, etc.)
│       └── constants.ts            # Constantes partagées
│
├── data/                           # Données persistantes (volume Docker)
│   ├── kinbot.db                   # Base de données SQLite
│   ├── uploads/                    # Fichiers uploadés
│   └── workspaces/                 # Workspaces des Kins
│       ├── <kin-id>/
│       │   ├── tools/              # Outils custom du Kin
│       │   └── ...                 # Fichiers de travail
│       └── ...
│
├── docs/                           # Documentation
│   ├── idea.md                     # Spec fonctionnelle
│   └── schema.md                   # Schéma de BDD
│
└── public/                         # Assets statiques (favicon, etc.)
```

---

## Conventions

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| **Fichiers TS** | kebab-case | `kin-engine.ts`, `prompt-builder.ts` |
| **Composants React** | PascalCase | `ChatPanel.tsx`, `MessageBubble.tsx` |
| **Types/Interfaces** | PascalCase | `KinConfig`, `ProviderCapability` |
| **Fonctions** | camelCase | `buildSystemPrompt()`, `enqueueMessage()` |
| **Constantes** | SCREAMING_SNAKE_CASE | `MAX_TASK_DEPTH`, `DEFAULT_MODEL` |
| **Tables DB** | snake_case | `vault_secrets`, `queue_items` |
| **Routes API** | kebab-case | `/api/mcp-servers`, `/api/vault` |
| **Variables d'env** | SCREAMING_SNAKE_CASE | `KINBOT_DATA_DIR`, `ENCRYPTION_KEY` |

### Imports

- Imports absolus depuis `src/` (via tsconfig paths) :
  ```typescript
  import { buildSystemPrompt } from '@/server/services/prompt-builder'
  import type { Kin } from '@/shared/types'
  ```
- Pas d'index barrels dans les dossiers profonds (imports explicites)

### Internationalisation (i18n)

- **Librairie** : `react-i18next` + `i18next`
- **Langue de base** : anglais (`en.json`). Toutes les clés sont en anglais
- **Langues supportées** : `en`, `fr`
- **Fichiers de traduction** : `src/client/locales/{lang}.json` (un fichier plat par langue)
- **Détection de la langue** : a partir de la préférence utilisateur (`user_profiles.language`), pas du navigateur
- **Convention des clés** : `namespace.element.action` (ex: `sidebar.kins.title`, `chat.input.placeholder`, `settings.providers.add`)
- **Composants** : utiliser le hook `useTranslation()` dans les composants, jamais de texte en dur dans le JSX

### Erreurs

- Les services retournent des `Result<T, Error>` ou throw des erreurs typées
- Les routes Hono catchent les erreurs et retournent des réponses JSON standardisées :
  ```json
  { "error": { "code": "KIN_NOT_FOUND", "message": "..." } }
  ```

### Fichiers de configuration racine

| Fichier | Rôle |
|---|---|
| `package.json` | Dépendances, scripts (`dev`, `build`, `start`, `db:migrate`) |
| `tsconfig.json` | Config TypeScript (strict, paths) |
| `drizzle.config.ts` | Config Drizzle (SQLite, chemin DB, migrations) |
| `vite.config.ts` | Config Vite (proxy API en dev, build output) |
| `tailwind.config.ts` | Config Tailwind (design tokens, dark mode) |
| `components.json` | Config shadcn/ui |

---

## Build et déploiement

### Développement

```bash
bun run dev
```

- Vite dev server sur le port 5173 (frontend) avec proxy vers le backend
- Hono dev server sur le port 3000 (backend)
- Hot reload sur les deux

### Production

```bash
bun run build   # Build Vite → dist/client/
bun run start   # Hono sert l'API + les fichiers statiques
```

Le backend Hono sert les assets statiques depuis `dist/client/` en production. Un seul process, un seul port.

### Docker

```bash
docker run -v ./data:/app/data -p 3000:3000 kinbot
```

Le volume `data/` contient la DB, les uploads et les workspaces. Tout le reste est stateless.
