# KinBot — README Optimization

*Run #4 — 2026-02-25*

---

## Diagnostic du README actuel

Le README actuel est **techniquement complet** mais manque d'impact visuel et émotionnel dans les premiers écrans. Sur GitHub, les gens décident en ~5 secondes s'ils restent ou partent.

### Ce qui marche
- Badges propres et cohérents
- "What is KinBot?" est bien écrit, clair
- Architecture ASCII art est un plus pour les devs
- Quick Start avec one-liner, Docker, et manuel : parfait

### Ce qui ne marche pas
- **Pas de visuel** — zéro screenshot, zéro GIF. C'est le problème #1. Un projet UI sans screenshot c'est comme un restaurant sans photo du plat.
- **Le tagline dans le header est trop long** — "A self-hosted platform of specialized AI agents with persistent identity, continuous memory, and real collaboration" = 20 mots. Trop pour un scan rapide.
- **La section Features est une liste à puces** — dense, uniforme, pas de hiérarchie visuelle. Tout a le même poids.
- **Pas de "wow moment"** — rien qui fasse dire "je dois essayer ça". Le README informe mais ne séduit pas.
- **Le séparateur `---` après le header** casse le flow visuel

---

## Proposition : Réécriture des 3 premiers écrans

### Écran 1 : Le Hook (ce qu'on voit sans scroller)

```markdown
<div align="center">

# KinBot

**AI agents that actually remember you.**

Self-hosted. Persistent memory. Real collaboration.

[![GitHub Release](https://img.shields.io/github/v/release/MarlBurroW/kinbot?style=flat-square&color=a855f7)](https://github.com/MarlBurroW/kinbot/releases)
[![GitHub Stars](https://img.shields.io/github/stars/MarlBurroW/kinbot?style=flat-square&color=ec4899)](https://github.com/MarlBurroW/kinbot)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://github.com/MarlBurroW/kinbot/pkgs/container/kinbot)

<!-- GIF démo ici — 15 secondes, voir script ci-dessous -->
<!-- <img src="docs/demo.gif" alt="KinBot demo" width="720" /> -->

[Website](https://marlburrow.github.io/kinbot/) · [Quick Start](#-quick-start) · [Features](#-features) · [Architecture](#-architecture) · [Contributing](#contributing)

</div>
```

**Changements clés :**
1. Tagline courte et percutante : "AI agents that actually remember you."
2. Sous-tagline en 3 mots-clés séparés par des points
3. Ajout badge Docker (les self-hosters cherchent ça en premier)
4. Retrait des badges Runtime/Stack (info secondaire, dilue l'impact)
5. Emplacement réservé pour le GIF démo (priorité absolue)
6. Emojis dans les liens d'ancrage pour la navigation

### Écran 2 : Le "Pourquoi" (juste après le fold)

```markdown
## Why KinBot?

Most AI tools treat every conversation as **disposable**. You explain yourself Monday, they forget by Tuesday.

KinBot is different. You create **Kins** — AI agents with:

| | |
|---|---|
| 🧠 **Persistent memory** | They remember every conversation. Forever. Vector search + full-text across months of interactions. |
| 🎭 **Real identity** | Name, role, personality, avatar. They know who they are and who you are. |
| 🤝 **Collaboration** | Kins talk to each other, delegate tasks, spawn workers. A team, not a chatbot. |
| ⚡ **Autonomy** | Cron jobs, webhooks, Telegram. They work while you sleep. |
| 🏠 **Self-hosted** | One process. One SQLite file. Your data never leaves your server. |

> *"Like having your own team of AI specialists that live on your server and never forget a thing."*
```

**Pourquoi ce format :**
- Tableau invisible (sans header visible) pour un layout aéré sur GitHub
- Emojis comme repères visuels (scannable en 3 secondes)
- Citation en italique en bas : accroche émotionnelle
- 5 points max (la mémoire humaine retient 5-7 items)

### Écran 3 : Preuve visuelle + Quick Start

```markdown
## 📸 Screenshots

<!-- 3-4 screenshots en grid -->
<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard with multiple Kins" width="45%" />
  <img src="docs/screenshots/conversation.png" alt="Conversation with memory recall" width="45%" />
</p>
<p align="center">
  <img src="docs/screenshots/kin-settings.png" alt="Kin identity configuration" width="45%" />
  <img src="docs/screenshots/memory.png" alt="Long-term memory view" width="45%" />
</p>

## 🚀 Quick Start

```bash
docker run -d --name kinbot -p 3000:3000 -v kinbot-data:/app/data ghcr.io/marlburrow/kinbot:latest
```

Open `http://localhost:3000` — done. The onboarding wizard handles the rest.

<details>
<summary>Other install methods (curl, manual, docker-compose)</summary>
<!-- contenu existant ici, plié par défaut -->
</details>
```

**Pourquoi :**
- Screenshots en grid 2x2 : preuve immédiate que le projet est réel et beau
- Quick Start réduit à UNE commande Docker (le chemin le plus court)
- Autres méthodes en `<details>` plié : pas de bruit pour ceux qui veulent juste essayer

---

## Plan Screenshots (à capturer)

| # | Vue | Ce qu'elle montre | Impact |
|---|-----|-------------------|--------|
| 1 | **Dashboard** | 3-4 Kins avec avatars, noms, derniers messages | "C'est un vrai produit, pas un POC" |
| 2 | **Conversation** | Un Kin qui rappelle un fait ancien dans sa réponse | "Il se souvient vraiment" |
| 3 | **Configuration Kin** | Nom, rôle, avatar, modèle, personnalité | "Je peux personnaliser chaque agent" |
| 4 | **Mémoire** | Vue des souvenirs extraits avec recherche | "La mémoire est tangible, pas magique" |

**Format :** PNG, 1280x800, mode sombre (plus esthétique sur README GitHub sombre). Ajouter un cadre subtil (1px border-radius) pour que les screenshots ne se fondent pas dans le fond blanc.

**Outil :** Screenshot direct du navigateur, ou [CleanShot](https://cleanshot.com) / [Flameshot](https://github.com/flameshot-org/flameshot) avec padding et ombre.

---

## Script GIF Démo (15-20 secondes)

**Scénario :**

| Seconde | Action | Ce qu'on voit |
|---------|--------|---------------|
| 0-3 | Vue dashboard | 3 Kins visibles avec avatars et rôles différents |
| 3-5 | Clic sur un Kin "Atlas" (assistant général) | Ouverture de la conversation |
| 5-9 | L'utilisateur tape : "What was the Docker issue we debugged last week?" | Message envoyé |
| 9-14 | Atlas répond avec du contexte précis : "Last Tuesday you had a port conflict on container X..." | Le Kin se souvient ! Moment wow. |
| 14-17 | Scroll rapide vers le haut | On voit des messages anciens, la conversation est longue et continue |
| 17-20 | Retour au dashboard | Fin propre |

**Outils :** [ScreenToGif](https://www.screentogif.com/) (Windows) ou `ffmpeg` (capture → crop → gif). Viser < 5 MB pour un chargement rapide sur GitHub.

---

## Badges : Garder ou Retirer ?

| Badge actuel | Verdict | Raison |
|-------------|---------|--------|
| GitHub Release | ✅ Garder | Signal de maturité |
| GitHub Stars | ✅ Garder | Social proof |
| License AGPL-3.0 | ✅ Garder | Les self-hosters vérifient ça en premier |
| Runtime: Bun | ❌ Retirer du header | Info technique, pas un argument de choix. Mettre dans la section Tech Stack. |
| Stack: React + Hono | ❌ Retirer du header | Idem, info de contributeur, pas d'utilisateur. |

**Ajouter :**
| Badge | Pourquoi |
|-------|----------|
| Docker ready | Signal immédiat "je peux l'installer en 30 sec" |
| PRs Welcome | Invite les contributeurs (quand prêt) |

---

## Section Features : Restructuration

Le README actuel liste ~25 features en 5 sous-sections. C'est exhaustif mais écrasant.

**Proposition :** Réduire à 3 blocs visuels avec icônes, plier les détails.

```markdown
## ✨ Features

### 🧠 Intelligence
Persistent memory (vector + full-text) · Session compacting · Sub-agents · Inter-Kin communication

### 🔧 Automation
Cron jobs · Webhooks · Telegram · MCP servers · Custom tools · 15 AI providers (incl. Ollama)

### 🔒 Security & Privacy
AES-256-GCM vault · Auth with roles · Invitation system · 100% self-hosted

<details>
<summary>Full feature list</summary>

<!-- la liste détaillée actuelle ici -->

</details>
```

**Principe :** Résumé scannable en haut, détails pour ceux qui veulent creuser.

---

## Section Architecture : Garder telle quelle

L'ASCII art est un atout. Les devs adorent ça. Ne pas y toucher.

---

## Résumé des actions

### Priorité 1 (bloquant pour le lancement)
- [ ] **Capturer 4 screenshots** de l'app en action
- [ ] **Enregistrer le GIF démo** (15-20s)
- [ ] **Réécrire le header** (tagline courte + badges épurés)

### Priorité 2 (amélioration significative)
- [ ] **Réécrire "What is KinBot?"** → "Why KinBot?" avec tableau à emojis
- [ ] **Restructurer Features** → 3 blocs + details plié
- [ ] **Plier les install methods** alternatives sous `<details>`

### Priorité 3 (polish)
- [ ] Ajouter badge Docker + PRs Welcome
- [ ] Ajouter lien vers le GIF dans l'Open Graph
- [ ] Tester le rendu sur GitHub (mobile + desktop, dark + light)

---

## Ce qu'on ne touche PAS
- Architecture ASCII art (excellent tel quel)
- Section Configuration (claire et utile)
- Section Development (pour contributeurs, pas d'optimisation nécessaire)
- Tech Stack table (bien structurée)
