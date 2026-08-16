const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActivityType } = require('discord.js');
const config = require('./config');
const helpers = require('./utils/helpers');
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

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('✅ Slash commands registered successfully!');
    } catch (error) {
        console.error('❌ Failed to register slash commands:', error);
    }
})();

// Message prefix commands
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command name is an alias using helpers
    const mainCommand = helpers.getMainCommand(commandName);
    
    // If it's not an alias, try direct match
    const command = mainCommand ? client.commands.get(mainCommand) : client.commands.get(commandName);
    
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
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
        console.error(error);
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
});

// Detailed ready event
client.once('ready', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 BOT IS NOW ONLINE!');
    console.log('='.repeat(60));
    
    // Basic Info
    console.log(`\n📝 BASIC INFORMATION`);
    console.log('─'.repeat(40));
    console.log(`  Bot Name:     ${client.user.tag}`);
    console.log(`  Bot ID:       ${client.user.id}`);
    console.log(`  Status:       🟢 Online`);
    console.log(`  Prefix:       ${config.prefix}`);
    
    // Bot Statistics
    console.log(`\n📊 BOT STATISTICS`);
    console.log('─'.repeat(40));
    console.log(`  Servers:      ${client.guilds.cache.size}`);
    console.log(`  Users:        ${client.users.cache.size}`);
    console.log(`  Channels:     ${client.channels.cache.size}`);
    console.log(`  Commands:     ${client.commands.size}`);
    console.log(`  Aliases:      ${Object.keys(helpers.commandAliases).length}`);
    
    // Server Details
    console.log(`\n🏠 SERVER DETAILS`);
    console.log('─'.repeat(40));
    for (const guild of client.guilds.cache.values()) {
        await guild.fetch();
        const owner = await guild.fetchOwner().catch(() => null);
        console.log(`  ${guild.name}`);
        console.log(`    ID:        ${guild.id}`);
        console.log(`    Members:   ${guild.memberCount}`);
        console.log(`    Owner:     ${owner ? owner.user.tag : 'Unknown'}`);
        console.log(`    Created:   ${guild.createdAt.toLocaleDateString()}`);
        console.log(`    Roles:     ${guild.roles.cache.size - 1}`);
        console.log(`    Emojis:    ${guild.emojis.cache.size}`);
        console.log(`    Boost:     Level ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`);
    }
    
    // System Information
    console.log(`\n💻 SYSTEM INFORMATION`);
    console.log('─'.repeat(40));
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const usedMemory = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
    const cpuUsage = os.loadavg()[0].toFixed(2);
    
    console.log(`  Platform:     ${os.platform()} ${os.release()}`);
    console.log(`  Architecture: ${os.arch()}`);
    console.log(`  CPU Cores:    ${os.cpus().length}`);
    console.log(`  CPU Usage:    ${cpuUsage}%`);
    console.log(`  Memory:       ${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB (${memoryUsage}%)`);
    console.log(`  Node.js:      ${process.version}`);
    console.log(`  Discord.js:   ${require('discord.js').version}`);
    
    // Uptime Details
    console.log(`\n⏱️ UPTIME DETAILS`);
    console.log('─'.repeat(40));
    console.log(`  Started At:   ${new Date().toLocaleString()}`);
    console.log(`  Ping:         ${client.ws.ping}ms`);
    
    // Command List with Aliases
    console.log(`\n📋 COMMAND LIST (${client.commands.size} commands)`);
    console.log('─'.repeat(40));
    const commandList = helpers.getCommandList();
    for (const [name, data] of Object.entries(commandList)) {
        console.log(`  ${data.display}`);
    }
    
    // Status Message
    console.log(`\n🔄 STATUS UPDATES`);
    console.log('─'.repeat(40));
    console.log(`  Setting bot status...`);
    console.log(`  Activity: Watching ${client.guilds.cache.size} servers`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ BOT IS READY AND FULLY OPERATIONAL!');
    console.log('='.repeat(60) + '\n');
    
    // Set bot status
    client.user.setPresence({
        activities: [
            {
                name: `${client.guilds.cache.size} servers | ${config.prefix}help`,
                type: ActivityType.Watching
            }
        ],
        status: 'online'
    });
});

// Error handling
client.on('error', error => {
    console.error('❌ Client Error:', error);
});

client.on('warn', warning => {
    console.warn('⚠️ Warning:', warning);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled Promise Rejection:', error);
});

// Login
console.log('🚀 Starting bot...');
client.login(config.token);
