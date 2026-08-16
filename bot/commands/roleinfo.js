const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Gets detailed role information')
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to get info for')
                .setRequired(true)),
    
    async execute(message, args) {
        let role;
        if (args[0]) {
            const id = args[0].replace(/[<@&>]/g, '');
            role = message.guild.roles.cache.get(id);
        }
        
        if (!role) {
            return message.reply('❌ Please specify a valid role!');
        }
        
        const embed = createRoleInfoEmbed(role);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const role = interaction.options.getRole('role');
        const embed = createRoleInfoEmbed(role);
        await interaction.reply({ embeds: [embed] });
    }
};

function createRoleInfoEmbed(role) {
    const permissions = role.permissions.toArray();
    const perms = permissions.length > 10 
        ? `${permissions.slice(0, 10).join(', ')}... (+${permissions.length - 10} more)`
        : permissions.join(', ') || 'None';
    
    const embed = new EmbedBuilder()
        .setTitle(`🔰 Role Info: ${role.name}`)
        .setColor(role.hexColor || config.colors.primary)
        .addFields(
            { name: '📝 Basic Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Role Name', value: role.name, inline: true },
            { name: 'Role ID', value: role.id, inline: true },
            { name: 'Color', value: role.hexColor || 'None', inline: true },
            { name: 'Mention', value: `<@&${role.id}>`, inline: true },
            { name: 'Position', value: `${role.position}`, inline: true },
            { name: '📊 Statistics', value: '━━━━━━━━━━━', inline: false },
            { name: 'Members', value: `${role.members.size}`, inline: true },
            { name: 'Permissions Count', value: `${permissions.length}`, inline: true },
            { name: 'Hoist', value: role.hoist ? '✅ Yes' : '❌ No', inline: true },
            { name: 'Mentionable', value: role.mentionable ? '✅ Yes' : '❌ No', inline: true },
            { name: 'Managed', value: role.managed ? '✅ Yes (Bot role)' : '❌ No', inline: true },
            { name: '🛡️ Permissions', value: '━━━━━━━━━━━', inline: false },
            { name: 'Permissions', value: perms, inline: false }
        )
        .setFooter({ text: `Server: ${role.guild.name}` })
        .setTimestamp();

    return embed;
}
