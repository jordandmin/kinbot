import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenvConfig();

/**
 * Schema for validating environment variables
 * All required variables must be present for the bot to start
 */
const envSchema = z.object({
  // Discord configuration
  DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID is required'),
  DISCORD_GUILD_ID: z.string().optional(),

  // Bot configuration
  BOT_PREFIX: z.string().default('!'),
  BOT_LANGUAGE: z.string().default('en'),
  BOT_ACTIVITY: z.string().optional(),
  BOT_ACTIVITY_TYPE: z
    .enum(['PLAYING', 'WATCHING', 'LISTENING', 'STREAMING', 'COMPETING'])
    .default('PLAYING'),

  // Database configuration
  DATABASE_URL: z.string().optional(),

  // Logging configuration
  // Using 'info' in dev — 'debug' is too noisy for my workflow
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Parsed and validated configuration object
 * Throws an error if any required environment variables are missing
 */
function parseConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment configuration:\n${errors}\n\nPlease check your .env file.`
    );
  }

  return result.data;
}

export const config = parseConfig();

export type Config = typeof config;
