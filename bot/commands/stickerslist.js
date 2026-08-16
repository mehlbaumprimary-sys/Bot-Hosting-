const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stickerslist')
        .setDescription('Displays all server stickers'),
    
    async execute(message, args) {
        const embed = createStickerListEmbed(message.guild);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = createStickerListEmbed(interaction.guild);
        await interaction.reply({ embeds: [embed] });
    }
};

function createStickerListEmbed(guild) {
    const stickers = guild.stickers.cache;
    const total = stickers.size;
    
    let stickerList = stickers.map(s => `${s.name}`).join('\n') || 'No stickers found';
    
    const embed = new EmbedBuilder()
        .setTitle(`🎨 Server Stickers - ${guild.name}`)
        .setColor(config.colors.primary)
        .addFields(
            { name: 'Total Stickers', value: `${total}`, inline: true },
            { name: 'Stickers List', value: stickerList, inline: false }
        )
        .setFooter({ text: `Server ID: ${guild.id}` })
        .setTimestamp();

    return embed;
}
