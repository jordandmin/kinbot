# KinBot — Configuration centralisée

Toutes les valeurs configurables de la plateforme, regroupées par domaine. Ces valeurs sont définies dans `src/server/config.ts` et peuvent être surchargées via variables d'environnement.

---

## Général

| Clé | Env var | Default | Description |
|---|---|---|---|
| `port` | `PORT` | `3000` | Port du serveur HTTP |
| `dataDir` | `KINBOT_DATA_DIR` | `./data` | Répertoire des données persistantes (DB, uploads, workspaces) |
| `encryptionKey` | `ENCRYPTION_KEY` | — (requis) | Clé de chiffrement pour les secrets du Vault et les configs provider. Doit être générée au premier lancement si absente |
| `logLevel` | `LOG_LEVEL` | `info` | Niveau de log : 'debug', 'info', 'warn', 'error' |

---

## Base de données

| Clé | Env var | Default | Description |
|---|---|---|---|
| `dbPath` | `DB_PATH` | `{dataDir}/kinbot.db` | Chemin du fichier SQLite |

---

## Compacting

| Clé | Env var | Default | Description |
|---|---|---|---|
| `compacting.messageThreshold` | `COMPACTING_MESSAGE_THRESHOLD` | `50` | Nombre de messages non compactés avant déclenchement du compacting |
| `compacting.tokenThreshold` | `COMPACTING_TOKEN_THRESHOLD` | `30000` | Nombre estimé de tokens dans les messages non compactés avant déclenchement |
| `compacting.model` | `COMPACTING_MODEL` | — | Modèle utilisé pour le compacting. Si non défini, utilise le modèle du Kin |
| `compacting.maxSnapshotsPerKin` | `COMPACTING_MAX_SNAPSHOTS` | `10` | Nombre max de snapshots conservés par Kin (les plus anciens sont supprimés) |

---

## Mémoire long terme

| Clé | Env var | Default | Description |
|---|---|---|---|
| `memory.extractionModel` | `MEMORY_EXTRACTION_MODEL` | — | Modèle léger pour l'extraction de mémoires (ex: Haiku). Si non défini, utilise le modèle du Kin |
| `memory.maxRelevantMemories` | `MEMORY_MAX_RELEVANT` | `10` | Nombre max de mémoires injectées dans le prompt système |
| `memory.similarityThreshold` | `MEMORY_SIMILARITY_THRESHOLD` | `0.7` | Score minimum de similarité cosinus pour qu'une mémoire soit considérée pertinente |
| `memory.embeddingModel` | `MEMORY_EMBEDDING_MODEL` | `text-embedding-3-small` | Modèle d'embedding par défaut |
| `memory.embeddingDimension` | `MEMORY_EMBEDDING_DIMENSION` | `1536` | Dimension des vecteurs d'embedding |

---

## Queue

| Clé | Env var | Default | Description |
|---|---|---|---|
| `queue.userPriority` | — | `100` | Priorité des messages utilisateur |
| `queue.kinPriority` | — | `50` | Priorité des messages inter-Kins |
| `queue.taskPriority` | — | `50` | Priorité des messages de tâches |
| `queue.pollIntervalMs` | `QUEUE_POLL_INTERVAL` | `500` | Intervalle de vérification de la queue (ms) |

---

## Tâches (sous-Kins)

| Clé | Env var | Default | Description |
|---|---|---|---|
| `tasks.maxDepth` | `TASKS_MAX_DEPTH` | `3` | Profondeur maximale de nesting des sous-Kins |
| `tasks.maxRequestInput` | `TASKS_MAX_REQUEST_INPUT` | `3` | Nombre max d'appels request_input par sous-Kin |
| `tasks.maxConcurrent` | `TASKS_MAX_CONCURRENT` | `10` | Nombre max de tâches concurrentes (tous Kins confondus) |

---

## Crons

| Clé | Env var | Default | Description |
|---|---|---|---|
| `crons.maxActive` | `CRONS_MAX_ACTIVE` | `50` | Nombre max de crons actifs |
| `crons.maxConcurrentExecutions` | `CRONS_MAX_CONCURRENT_EXEC` | `5` | Nombre max d'exécutions de crons concurrentes |

---

## Communication inter-Kins

| Clé | Env var | Default | Description |
|---|---|---|---|
| `interKin.maxChainDepth` | `INTER_KIN_MAX_CHAIN_DEPTH` | `5` | Profondeur max d'une chaîne de messages inter-Kins |
| `interKin.rateLimitPerMinute` | `INTER_KIN_RATE_LIMIT` | `20` | Nombre max de messages qu'un Kin peut envoyer a un autre par minute |

---

## Vault

| Clé | Env var | Default | Description |
|---|---|---|---|
| `vault.algorithm` | — | `aes-256-gcm` | Algorithme de chiffrement des secrets |

---

## Workspace

| Clé | Env var | Default | Description |
|---|---|---|---|
| `workspace.baseDir` | `WORKSPACE_BASE_DIR` | `{dataDir}/workspaces` | Répertoire racine des workspaces des Kins |

---

## Upload

| Clé | Env var | Default | Description |
|---|---|---|---|
| `upload.dir` | `UPLOAD_DIR` | `{dataDir}/uploads` | Répertoire de stockage des fichiers |
| `upload.maxFileSizeMb` | `UPLOAD_MAX_FILE_SIZE` | `50` | Taille max d'un fichier uploadé (Mo) |

---

## Exemple `config.ts`

```typescript
import { env } from 'bun'

export const config = {
  port: Number(env.PORT ?? 3000),
  dataDir: env.KINBOT_DATA_DIR ?? './data',
  encryptionKey: env.ENCRYPTION_KEY ?? '',
  logLevel: env.LOG_LEVEL ?? 'info',

  db: {
    path: env.DB_PATH ?? `${env.KINBOT_DATA_DIR ?? './data'}/kinbot.db`,
  },

  compacting: {
    messageThreshold: Number(env.COMPACTING_MESSAGE_THRESHOLD ?? 50),
    tokenThreshold: Number(env.COMPACTING_TOKEN_THRESHOLD ?? 30000),
    model: env.COMPACTING_MODEL ?? undefined,
    maxSnapshotsPerKin: Number(env.COMPACTING_MAX_SNAPSHOTS ?? 10),
  },

  memory: {
    extractionModel: env.MEMORY_EXTRACTION_MODEL ?? undefined,
    maxRelevantMemories: Number(env.MEMORY_MAX_RELEVANT ?? 10),
    similarityThreshold: Number(env.MEMORY_SIMILARITY_THRESHOLD ?? 0.7),
    embeddingModel: env.MEMORY_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    embeddingDimension: Number(env.MEMORY_EMBEDDING_DIMENSION ?? 1536),
  },

  queue: {
    userPriority: 100,
    kinPriority: 50,
    taskPriority: 50,
    pollIntervalMs: Number(env.QUEUE_POLL_INTERVAL ?? 500),
  },

  tasks: {
    maxDepth: Number(env.TASKS_MAX_DEPTH ?? 3),
    maxRequestInput: Number(env.TASKS_MAX_REQUEST_INPUT ?? 3),
    maxConcurrent: Number(env.TASKS_MAX_CONCURRENT ?? 10),
  },

  crons: {
    maxActive: Number(env.CRONS_MAX_ACTIVE ?? 50),
    maxConcurrentExecutions: Number(env.CRONS_MAX_CONCURRENT_EXEC ?? 5),
  },

  interKin: {
    maxChainDepth: Number(env.INTER_KIN_MAX_CHAIN_DEPTH ?? 5),
    rateLimitPerMinute: Number(env.INTER_KIN_RATE_LIMIT ?? 20),
  },

  vault: {
    algorithm: 'aes-256-gcm' as const,
  },

  workspace: {
    baseDir: env.WORKSPACE_BASE_DIR ?? `${env.KINBOT_DATA_DIR ?? './data'}/workspaces`,
  },

  upload: {
    dir: env.UPLOAD_DIR ?? `${env.KINBOT_DATA_DIR ?? './data'}/uploads`,
    maxFileSizeMb: Number(env.UPLOAD_MAX_FILE_SIZE ?? 50),
  },
} as const
```
