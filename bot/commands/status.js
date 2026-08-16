const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const config = require('../config');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows detailed bot status'),
    
    async execute(message, args) {
        const embed = await createStatusEmbed(message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = await createStatusEmbed(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createStatusEmbed(client) {
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024 / 1024;
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    const cpuUsage = os.loadavg()[0].toFixed(2);
    const uptime = client.uptime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    
    const embed = new EmbedBuilder()
        .setTitle('📊 Bot Status')
        .setColor(config.colors.info)
        .addFields(
            { name: 'Bot Name', value: client.user.tag, inline: true },
            { name: 'Bot ID', value: client.user.id, inline: true },
            { name: 'Status', value: `${config.emojis.online} Online`, inline: true },
            { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
            { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Channels', value: `${client.channels.cache.size}`, inline: true },
            { name: 'Commands', value: `${client.commands.size}`, inline: true },
            { name: 'Memory Usage', value: `${memoryUsage}% (${usedMemory.toFixed(2)}/${totalMemory.toFixed(2)} GB)`, inline: true },
            { name: 'CPU Usage', value: `${cpuUsage}%`, inline: true },
            { name: 'Node.js Version', value: process.version, inline: true },
            { name: 'Discord.js Version', value: version, inline: true },
            { name: 'Platform', value: os.platform(), inline: true },
            { name: 'Architecture', value: os.arch(), inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true }
        )
        .setFooter({ text: `Status updated at` })
        .setTimestamp();

    return embed;
}
