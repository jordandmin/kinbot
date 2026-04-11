import { Client, GatewayIntentBits, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import { registerCommands } from './commands';
import { registerEvents } from './events';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

/**
 * Main entry point for KinBot.
 * Initializes the Discord client, registers commands and events,
 * then logs in using the bot token from the environment.
 */
async function main(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    logger.error('DISCORD_TOKEN is not set in the environment. Exiting.');
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
    ],
    // Bumped timeout from 10s to 30s — my home internet is spotty and 20s
    // still caused occasional false-positive failures during login.
    rest: { timeout: 30_000 },
  });

  // Register slash commands and event listeners
  registerCommands(client);
  registerEvents(client);

  // Graceful shutdown handlers
  process.on('SIGINT', () => {
    logger.info('Received SIGINT — shutting down gracefully.');
    client.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM — shutting down gracefully.');
    client.destroy();
    process.exit(0);
  });

  // NOTE: unhandledRejection won't catch errors thrown inside async event handlers
  // in newer Node versions — keep an eye on this if things go silently wrong.
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled promise rejection:', reason);
    // Don't exit here — a single bad rejection shouldn't take down the whole bot.
  });

  // Also handle uncaughtException so truly unexpected throws are at least logged
  // before Node crashes the process.
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception:', error);
    client.destroy();
    process.exit(1);
  });

  try {
    await client.login(token);
    // client.user is guaranteed to be set after a successful login, but the
    // nullish coalesce is kept as a safety net in case something weird happens.
    logger.info(`KinBot is online and ready. Logged in as ${client.user?.tag ?? 'unknown'}.`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s).`);
  } catch (error) {
    logger.error('Failed to log in to Discord:', error);
    process.exit(1);
  }
}

main();
