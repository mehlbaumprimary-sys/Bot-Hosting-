const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const config = require('./config');
const helpers = require('./utils/helpers');
const RPCManager = require('./utils/rpc');
const { logger } = require('./logger');
const { MetricsCollector } = require('./monitoring/metrics');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildPresences
    ]
});

client.commands = new Collection();
const commands = [];

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Register slash commands globally
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        logger.info('🔄 Registering global slash commands...');
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        logger.success(`✅ Registered ${commands.length} global slash commands`);
    } catch (error) {
        logger.error('❌ Failed to register slash commands:', error);
    }
})();

// Message prefix commands
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const mainCommand = helpers.getMainCommand(commandName);
    const command = mainCommand ? client.commands.get(mainCommand) : client.commands.get(commandName);
    
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        logger.error(`❌ Command error (${commandName}):`, error);
        await message.reply('❌ There was an error executing that command!');
    }
});

// Slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.executeSlash(interaction);
    } catch (error) {
        logger.error(`❌ Slash command error (${interaction.commandName}):`, error);
        await interaction.reply({ content: '❌ There was an error executing that command!', ephemeral: true });
    }
});

// Initialize RPC and Metrics
let rpcManager = null;
let metricsCollector = null;

// Load and execute ready event
const readyEvent = require('./events/ready');
client.once('ready', async () => {
    // Execute ready event
    await readyEvent.execute(client);
    
    // Initialize metrics
    metricsCollector = new MetricsCollector(client);
    metricsCollector.start();
    logger.success('📊 Metrics collector initialized!');
    
    // Initialize RPC
    rpcManager = new RPCManager(client);
    await rpcManager.initialize();
    logger.success('🎮 RPC initialized!');
});

// Error handling
client.on('error', error => {
    logger.error('❌ Client error:', error);
});

client.on('warn', warning => {
    logger.warn('⚠️ Client warning:', warning);
});

process.on('unhandledRejection', error => {
    logger.error('❌ Unhandled rejection:', error);
});

process.on('SIGINT', () => {
    logger.info('\n🛑 Shutting down...');
    if (rpcManager) rpcManager.destroy();
    if (metricsCollector) metricsCollector.stop();
    client.destroy();
    process.exit(0);
});

// Login
logger.info('🚀 Starting bot...');
client.login(config.token);

module.exports = { client };
