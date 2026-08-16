const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Gets detailed user information (20 items)')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get info for')
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
        
        const embed = await createUserInfoEmbed(user, message.guild);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const user = interaction.options.getUser('user');
        const embed = await createUserInfoEmbed(user, interaction.guild);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createUserInfoEmbed(user, guild) {
    const member = await guild.members.fetch(user.id).catch(() => null);
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const bannerURL = user.bannerURL({ dynamic: true, size: 1024 });
    
    const status = user.presence?.status || 'offline';
    const statusEmoji = {
        online: '🟢',
        idle: '🟡',
        dnd: '🔴',
        offline: '⚫'
    }[status] || '⚫';
    
    const created = Math.floor(user.createdTimestamp / 1000);
    const joined = member ? Math.floor(member.joinedTimestamp / 1000) : 'N/A';
    
    const roles = member ? member.roles.cache.filter(r => r.id !== guild.id).map(r => `<@&${r.id}>`) : [];
    const roleList = roles.length > 0 ? roles.slice(0, 5).join(', ') + (roles.length > 5 ? `... (+${roles.length - 5} more)` : '') : 'None';
    
    const embed = new EmbedBuilder()
        .setTitle(`👤 User Info: ${user.tag}`)
        .setThumbnail(avatarURL)
        .setColor(config.colors.primary)
        .addFields(
            { name: '📝 Basic Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Username', value: user.username, inline: true },
            { name: 'Discriminator', value: `#${user.discriminator}`, inline: true },
            { name: 'Display Name', value: member?.displayName || user.username, inline: true },
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Bot', value: user.bot ? '✅ Yes' : '❌ No', inline: true },
            { name: 'Status', value: `${statusEmoji} ${status.charAt(0).toUpperCase() + status.slice(1)}`, inline: true },
            { name: '📅 Account Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Account Created', value: `<t:${created}:F>`, inline: true },
            { name: 'Joined Server', value: joined !== 'N/A' ? `<t:${joined}:F>` : 'N/A', inline: true },
            { name: 'Account Age', value: `<t:${created}:R>`, inline: true },
            { name: 'Join Age', value: joined !== 'N/A' ? `<t:${joined}:R>` : 'N/A', inline: true },
            { name: '📊 Server Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Roles Count', value: member ? `${member.roles.cache.size - 1}` : '0', inline: true },
            { name: 'Highest Role', value: member?.roles?.highest?.name || 'None', inline: true },
            { name: 'Roles', value: roleList, inline: true },
            { name: 'Permissions', value: member?.permissions?.toArray().length || '0', inline: true },
            { name: 'Is Boosting', value: member?.premiumSince ? '✅ Yes' : '❌ No', inline: true },
            { name: 'Boosting Since', value: member?.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>` : 'N/A', inline: true },
            { name: '🖼️ Media', value: '━━━━━━━━━━━', inline: false },
            { name: 'Avatar', value: `[Link](${avatarURL})`, inline: true },
            { name: 'Banner', value: bannerURL ? `[Link](${bannerURL})` : 'None', inline: true },
            { name: 'Avatar Type', value: user.avatar ? 'Custom' : 'Default', inline: true }
        )
        .setFooter({ text: `ID: ${user.id}` })
        .setTimestamp();

    return embed;
}
