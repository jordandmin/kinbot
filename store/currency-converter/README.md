# 💱 Currency Converter

Convert between currencies using live exchange rates from the European Central Bank.

## Features

- **Live conversion** between 30+ currencies (USD, EUR, GBP, JPY, CHF, etc.)
- **Historical rates** dating back to January 1999
- **Multi-target** conversion (convert to several currencies at once)
- **No API key required** - uses the free [Frankfurter API](https://frankfurter.dev/)

## Tools

| Tool | Description |
|------|-------------|
| `convert_currency` | Convert an amount between currencies |
| `list_currencies` | List all supported currency codes |
| `historical_rate` | Get exchange rates for a specific past date |

## Example prompts

- "How much is 100 USD in EUR?"
- "Convert 500 EUR to GBP, CHF, and JPY"
- "What was the EUR/USD rate on 2020-03-15?"
- "What currencies are supported?"

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Base Currency | `EUR` | Default source currency when not specified |

## Data source

Rates are provided by the [European Central Bank](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/) via the Frankfurter API. Rates are updated once per working day (around 16:00 CET).
