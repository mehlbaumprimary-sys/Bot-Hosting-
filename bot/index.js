const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const config = require('./config');
const helpers = require('./utils/helpers');
const RPCManager = require('./utils/rpc');
const { logger } = require('./logger');
const constants = require('./constants');
const { MetricsCollector } = require('./monitoring/metrics');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
        logger.error(`Command error (${commandName}):`, error);
        await message.reply('There was an error executing that command!');
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
        logger.error(`Slash command error (${interaction.commandName}):`, error);
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
});

// Initialize RPC and Metrics
let rpcManager = null;
let metricsCollector = null;

// Enhanced ready event
client.once('ready', async () => {
    // Initialize metrics
    metricsCollector = new MetricsCollector(client);
    metricsCollector.start();
    
    // Log startup
    logger.header('BOT ONLINE');
    logger.info(`🤖 ${client.user.tag} is now online!`);
    logger.info(`📊 Connected to ${client.guilds.cache.size} servers`);
    logger.info(`👥 Serving ${client.users.cache.size.toLocaleString()} users`);
    logger.info(`⚡ Ping: ${client.ws.ping}ms`);
    
    // Initialize RPC
    rpcManager = new RPCManager(client);
    await rpcManager.initialize();
    logger.success('✅ RPC initialized');
    
    // Set presence
    client.user.setPresence({
        activities: [
            {
                name: `${client.guilds.cache.size} servers | ${config.prefix}help`,
                type: 3
            }
        ],
        status: 'online'
    });
    
    // Log command count
    logger.info(`📋 ${client.commands.size} commands loaded`);
    logger.info(`🔧 ${Object.keys(helpers.commandAliases).length} command groups with aliases`);
    
    // System info
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const usedMemory = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    logger.info(`💻 Memory: ${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB`);
    logger.info(`🖥️  Node.js: ${process.version}`);
    
    logger.header('READY');
});

// Error handling
client.on('error', error => {
    logger.error('Client error:', error);
});

client.on('warn', warning => {
    logger.warn('Client warning:', warning);
});

process.on('unhandledRejection', error => {
    logger.error('Unhandled rejection:', error);
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
