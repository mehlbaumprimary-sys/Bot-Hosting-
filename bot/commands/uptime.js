const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows bot uptime information'),
    
    async execute(message, args) {
        const embed = createUptimeEmbed(message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = createUptimeEmbed(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

function createUptimeEmbed(client) {
    const uptime = client.uptime;
    const seconds = Math.floor((uptime / 1000) % 60);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    
    const uptimeStr = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    
    const startTime = new Date(Date.now() - uptime);
    
    const embed = new EmbedBuilder()
        .setTitle('⏱️ Bot Uptime')
        .setColor(config.colors.success)
        .addFields(
            { name: 'Total Uptime', value: uptimeStr, inline: false },
            { name: 'Days', value: `${days}`, inline: true },
            { name: 'Hours', value: `${hours}`, inline: true },
            { name: 'Minutes', value: `${minutes}`, inline: true },
            { name: 'Started At', value: startTime.toLocaleString(), inline: false }
        )
        .setFooter({ text: `Bot: ${client.user.tag}` })
        .setTimestamp();

    return embed;
}
