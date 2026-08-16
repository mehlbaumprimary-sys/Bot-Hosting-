const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const config = require('./config');
const Helpers = require('./utils/helpers');
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

// Register slash commands
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('Slash commands registered successfully!');
    } catch (error) {
        console.error(error);
    }
})();

// Message prefix commands with alias support
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if command exists or is an alias
    let actualCommand = Helpers.getMainCommand(commandName);
    if (!actualCommand) {
        // Try direct match
        actualCommand = commandName;
    }

    const command = client.commands.get(actualCommand);
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

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Prefix: ${config.prefix}`);
    console.log(`Loaded ${client.commands.size} commands`);
    console.log(`Serving ${client.guilds.cache.size} servers`);
    console.log(`Bot Stats:`, Helpers.getBotStats(client));
});

client.login(config.token);
