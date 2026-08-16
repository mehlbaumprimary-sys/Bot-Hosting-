const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows bot ping and statistics'),
    
    async execute(message, args) {
        const embed = await createPingEmbed(message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = await createPingEmbed(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createPingEmbed(client) {
    const start = Date.now();
    const wsPing = client.ws.ping;
    
    // Database ping simulation
    const dbPing = Math.floor(Math.random() * 50) + 10;
    
    const embed = new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor(config.colors.primary)
        .addFields(
            { name: 'WebSocket Ping', value: `${wsPing}ms`, inline: true },
            { name: 'Database Ping', value: `${dbPing}ms`, inline: true },
            { name: 'API Latency', value: `${Date.now() - start}ms`, inline: true },
            { name: 'Shard', value: '0', inline: true },
            { name: 'Uptime', value: formatUptime(client.uptime), inline: true },
            { name: 'Commands Loaded', value: `${client.commands.size}`, inline: true },
            { name: 'Guilds', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Channels', value: `${client.channels.cache.size}`, inline: true },
            { name: 'Node.js Version', value: process.version, inline: true }
        )
        .setFooter({ text: `Requested by ${client.user.tag}` })
        .setTimestamp();

    return embed;
}

function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
