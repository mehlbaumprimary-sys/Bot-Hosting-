const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Gets detailed server information'),
    
    async execute(message, args) {
        const embed = await createServerInfoEmbed(message.guild);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = await createServerInfoEmbed(interaction.guild);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createServerInfoEmbed(guild) {
    await guild.fetch();
    
    const owner = await guild.fetchOwner();
    const created = Math.floor(guild.createdTimestamp / 1000);
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;
    const categories = channels.filter(c => c.type === 4).size;
    const stageChannels = channels.filter(c => c.type === 13).size;
    
    const boosts = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier || 0;
    
    const embed = new EmbedBuilder()
        .setTitle(`🏠 Server Info: ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .setColor(config.colors.primary)
        .addFields(
            { name: '📝 Basic Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Server Name', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Owner', value: owner ? `<@${owner.id}>` : 'Unknown', inline: true },
            { name: 'Created At', value: `<t:${created}:F>`, inline: true },
            { name: 'Server Age', value: `<t:${created}:R>`, inline: true },
            { name: 'Region', value: guild.preferredLocale || 'N/A', inline: true },
            { name: '📊 Statistics', value: '━━━━━━━━━━━', inline: false },
            { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Total Channels', value: `${channels.size}`, inline: true },
            { name: 'Text Channels', value: `${textChannels}`, inline: true },
            { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
            { name: 'Categories', value: `${categories}`, inline: true },
            { name: 'Stage Channels', value: `${stageChannels}`, inline: true },
            { name: 'Roles', value: `${guild.roles.cache.size - 1}`, inline: true },
            { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
            { name: 'Stickers', value: `${guild.stickers.cache.size}`, inline: true },
            { name: 'Boost Level', value: `${boostLevel} (${boosts} boosts)`, inline: true }
        )
        .setFooter({ text: `Server ID: ${guild.id}` })
        .setTimestamp();

    return embed;
}
