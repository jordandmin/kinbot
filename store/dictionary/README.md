# 📖 Dictionary Plugin

Look up word definitions, synonyms, antonyms, pronunciation, and examples using the free [Dictionary API](https://dictionaryapi.dev/).

## Tools

### `define_word`
Look up the full definition of a word, including:
- Part of speech (noun, verb, adjective, etc.)
- Definitions with examples
- Pronunciation (IPA and audio)
- Synonyms and antonyms

### `find_synonyms`
Find synonyms for a word, aggregated from all definitions.

### `find_antonyms`
Find antonyms (opposite words) for a word.

## Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `defaultLanguage` | select | `en` | Default language for lookups |

### Supported Languages

English (`en`), Spanish (`es`), French (`fr`), German (`de`), Italian (`it`), Portuguese (`pt`), Arabic (`ar`), Hindi (`hi`), Japanese (`ja`), Korean (`ko`), Russian (`ru`), Turkish (`tr`), Chinese (`zh`).

> **Note:** Not all languages have the same coverage. English has the most complete data.

## Example Usage

Ask your Kin:
- "What does 'ephemeral' mean?"
- "Find synonyms for 'happy'"
- "What are antonyms of 'verbose'?"
- "Define 'Schadenfreude' in German"

## API

This plugin uses the free, open-source [Dictionary API](https://dictionaryapi.dev/) — no API key required.
