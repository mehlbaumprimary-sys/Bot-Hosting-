const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getbotid')
        .setDescription('Gets the ID of a specific bot')
        .addUserOption(option => 
            option.setName('bot')
                .setDescription('The bot to get ID for')
                .setRequired(true)),
    
    async execute(message, args) {
        let bot;
        if (args[0]) {
            try {
                const id = args[0].replace(/[<@!>]/g, '');
                bot = await message.client.users.fetch(id);
            } catch {
                bot = message.mentions.users.first();
            }
        }
        
        if (!bot || !bot.bot) {
            return message.reply('❌ Please mention a valid bot!');
        }
        
        const embed = createBotIdEmbed(bot);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const bot = interaction.options.getUser('bot');
        if (!bot.bot) {
            return interaction.reply({ content: '❌ That user is not a bot!', ephemeral: true });
        }
        
        const embed = createBotIdEmbed(bot);
        await interaction.reply({ embeds: [embed] });
    }
};

function createBotIdEmbed(bot) {
    return new EmbedBuilder()
        .setTitle('🤖 Bot ID')
        .setColor(config.colors.primary)
        .addFields(
            { name: 'Bot', value: bot.tag, inline: true },
            { name: 'ID', value: bot.id, inline: true },
            { name: 'Mention', value: `<@${bot.id}>`, inline: true },
            { name: 'Developer', value: 'N/A', inline: true }
        )
        .setThumbnail(bot.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
}
