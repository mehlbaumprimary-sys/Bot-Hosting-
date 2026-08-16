const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolelist')
        .setDescription('Lists all server roles'),
    
    async execute(message, args) {
        const embed = createRoleListEmbed(message.guild);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = createRoleListEmbed(interaction.guild);
        await interaction.reply({ embeds: [embed] });
    }
};

function createRoleListEmbed(guild) {
    const roles = guild.roles.cache
        .filter(r => r.id !== guild.id)
        .sort((a, b) => b.position - a.position);
    
    const total = roles.size;
    let roleList = roles.map(r => `<@&${r.id}>`).join(', ') || 'No roles found';
    
    if (roleList.length > 1000) {
        roleList = roleList.slice(0, 997) + '...';
    }
    
    const embed = new EmbedBuilder()
        .setTitle(`📋 Server Roles - ${guild.name}`)
        .setColor(config.colors.primary)
        .addFields(
            { name: 'Total Roles', value: `${total}`, inline: true },
            { name: `Roles (${total})`, value: roleList, inline: false }
        )
        .setFooter({ text: `Server ID: ${guild.id}` })
        .setTimestamp();

    return embed;
}
