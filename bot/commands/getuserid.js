const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getuserid')
        .setDescription('Gets the ID of a specific user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get ID for')
                .setRequired(true)),
    
    async execute(message, args) {
        let user;
        if (args[0]) {
            try {
                const id = args[0].replace(/[<@!>]/g, '');
                user = await message.client.users.fetch(id);
            } catch {
                user = message.mentions.users.first() || message.author;
            }
        } else {
            user = message.author;
        }
        
        const embed = createUserIdEmbed(user);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const user = interaction.options.getUser('user');
        const embed = createUserIdEmbed(user);
        await interaction.reply({ embeds: [embed] });
    }
};

function createUserIdEmbed(user) {
    return new EmbedBuilder()
        .setTitle('🆔 User ID')
        .setColor(config.colors.primary)
        .addFields(
            { name: 'User', value: user.tag, inline: true },
            { name: 'ID', value: user.id, inline: true },
            { name: 'Mention', value: `<@${user.id}>`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
}
