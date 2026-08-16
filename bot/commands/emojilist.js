const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojilist')
        .setDescription('Displays all server emojis'),
    
    async execute(message, args) {
        const embed = createEmojiListEmbed(message.guild);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = createEmojiListEmbed(interaction.guild);
        await interaction.reply({ embeds: [embed] });
    }
};

function createEmojiListEmbed(guild) {
    const emojis = guild.emojis.cache;
    const total = emojis.size;
    const animated = emojis.filter(e => e.animated).size;
    const static = total - animated;
    
    let emojiList = emojis.map(e => `${e}`).join(' ') || 'No emojis found';
    
    // Truncate if too long
    if (emojiList.length > 1000) {
        emojiList = emojiList.slice(0, 997) + '...';
    }
    
    const embed = new EmbedBuilder()
        .setTitle(`🎨 Server Emojis - ${guild.name}`)
        .setColor(config.colors.primary)
        .addFields(
            { name: 'Total Emojis', value: `${total}`, inline: true },
            { name: 'Animated', value: `${animated}`, inline: true },
            { name: 'Static', value: `${static}`, inline: true },
            { name: 'All Emojis', value: emojiList, inline: false }
        )
        .setFooter({ text: `Server ID: ${guild.id}` })
        .setTimestamp();

    return embed;
}
