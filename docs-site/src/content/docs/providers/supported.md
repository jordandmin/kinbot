---
title: Supported Providers
description: All 24 AI providers supported by KinBot.
---

KinBot supports 24 AI providers out of the box. Each provider offers different capabilities: language models (LLM), embeddings, image generation, and web search.

## Provider Table

| Provider | LLM | Embedding | Image | Search | Rerank | API Key Required |
|----------|:---:|:---------:|:-----:|:------:|:------:|:----------------:|
| [Anthropic](https://console.anthropic.com/settings/keys) | ✅ | | | | | ✅ |
| [Anthropic (Claude Max)](https://claude.ai) | ✅ | | | | | ❌ (OAuth) |
| [OpenAI](https://platform.openai.com/api-keys) | ✅ | ✅ | ✅ | | | ✅ |
| [OpenAI (Codex CLI)](https://openai.com/index/introducing-codex/) | ✅ | | | | | ❌ (OAuth) |
| [Gemini](https://aistudio.google.com/apikey) | ✅ | | ✅ | | | ✅ |
| [Mistral AI](https://console.mistral.ai/api-keys) | ✅ | ✅ | | | | ✅ |
| [DeepSeek](https://platform.deepseek.com/api_keys) | ✅ | ✅ | | | | ✅ |
| [Groq](https://console.groq.com/keys) | ✅ | | | | | ✅ |
| [Together AI](https://api.together.xyz/settings/api-keys) | ✅ | ✅ | ✅ | | | ✅ |
| [Fireworks AI](https://fireworks.ai/account/api-keys) | ✅ | ✅ | ✅ | | | ✅ |
| [Ollama](https://ollama.ai) | ✅ | ✅ | | | | ❌ (local) |
| [OpenRouter](https://openrouter.ai/keys) | ✅ | ✅ | ✅ | | | ✅ |
| [Cohere](https://dashboard.cohere.com/api-keys) | ✅ | ✅ | | | ✅ | ✅ |
| [xAI](https://console.x.ai/) | ✅ | ✅ | ✅ | | | ✅ |
| [Perplexity](https://www.perplexity.ai/settings/api) | ✅ | | | ✅ | | ✅ |
| [Voyage](https://dash.voyageai.com/api-keys) | | ✅ | | | | ✅ |
| [Jina AI](https://jina.ai/api-dashboard/) | | ✅ | | | ✅ | ✅ |
| [Nomic](https://atlas.nomic.ai/cli-login) | | ✅ | | | | ✅ |
| [Replicate](https://replicate.com/account/api-tokens) | | | ✅ | | | ✅ |
| [Stability AI](https://platform.stability.ai/account/keys) | | | ✅ | | | ✅ |
| [fal.ai](https://fal.ai/dashboard/keys) | | | ✅ | | | ✅ |
| [Brave Search](https://brave.com/search/api/) | | | | ✅ | | ✅ |
| [Tavily](https://app.tavily.com/home) | | | | ✅ | | ✅ |
| [Serper](https://serper.dev/api-key) | | | | ✅ | | ✅ |

## Capabilities

- **LLM** — Chat and text completion models used for Kin conversations
- **Embedding** — Vector embedding models used for memory storage and retrieval
- **Image** — Image generation models (used by image generation tools)
- **Search** — Web search APIs (used by search tools)

## Configuration

Providers are configured in **Settings > Providers** in the KinBot UI. Each provider requires:

1. An **API key** (except Ollama and Anthropic OAuth)
2. Optionally, a **custom base URL** (useful for Ollama or proxy setups)

For Ollama, ensure the base URL points to your Ollama instance (e.g., `http://localhost:11434` or `http://host.docker.internal:11434` from Docker).

## API Endpoints

KinBot exposes several provider management endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/providers` | List all configured providers |
| `POST` | `/api/providers` | Add a new provider (auto-tests connection) |
| `PATCH` | `/api/providers/:id` | Update provider config (re-tests connection) |
| `DELETE` | `/api/providers/:id` | Delete a provider (blocked if it's the last with a required capability) |
| `GET` | `/api/providers/types` | List all available provider types (built-in + plugin) |
| `GET` | `/api/providers/capabilities` | Check which capabilities are currently available |
| `GET` | `/api/providers/models` | List all available models across valid providers |
| `POST` | `/api/providers/test` | Test a connection without saving |
| `POST` | `/api/providers/:id/test` | Re-test an existing provider's connection |

:::note
You cannot delete the last provider covering `llm` or `embedding` capabilities. KinBot will return a `409` error to prevent breaking core functionality.
:::

## Minimum Setup

To use KinBot, you need at minimum:

1. **One LLM provider** — For Kin conversations (e.g., Anthropic, OpenAI, Gemini)
2. **One embedding provider** — For memory to work (e.g., OpenAI with `text-embedding-3-small`)

Optional but recommended:
- A **search provider** for web search tools
- An **image provider** for image generation
