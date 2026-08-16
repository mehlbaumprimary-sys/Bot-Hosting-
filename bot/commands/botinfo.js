const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const config = require('../config');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Gets detailed bot information (20 items)')
        .addUserOption(option => 
            option.setName('bot')
                .setDescription('The bot to get info for')
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
        
        const embed = await createBotInfoEmbed(bot, message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const bot = interaction.options.getUser('bot');
        if (!bot.bot) {
            return interaction.reply({ content: '❌ That user is not a bot!', ephemeral: true });
        }
        
        const embed = await createBotInfoEmbed(bot, interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createBotInfoEmbed(bot, client) {
    const avatarURL = bot.displayAvatarURL({ dynamic: true, size: 1024 });
    const bannerURL = bot.bannerURL({ dynamic: true, size: 1024 });
    const created = Math.floor(bot.createdTimestamp / 1000);
    
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const usedMemory = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
    const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    const embed = new EmbedBuilder()
        .setTitle(`🤖 Bot Info: ${bot.tag}`)
        .setThumbnail(avatarURL)
        .setColor(config.colors.primary)
        .addFields(
            { name: '📝 Basic Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Bot Name', value: bot.username, inline: true },
            { name: 'Discriminator', value: `#${bot.discriminator}`, inline: true },
            { name: 'Bot ID', value: bot.id, inline: true },
            { name: 'Bot Type', value: 'Discord Bot', inline: true },
            { name: 'Status', value: '🤖 Online', inline: true },
            { name: 'Verified', value: '✅ Yes', inline: true },
            { name: '📅 Account Info', value: '━━━━━━━━━━━', inline: false },
            { name: 'Created At', value: `<t:${created}:F>`, inline: true },
            { name: 'Age', value: `<t:${created}:R>`, inline: true },
            { name: '🖼️ Media', value: '━━━━━━━━━━━', inline: false },
            { name: 'Avatar', value: `[Link](${avatarURL})`, inline: true },
            { name: 'Banner', value: bannerURL ? `[Link](${bannerURL})` : 'None', inline: true },
            { name: 'Avatar Type', value: bot.avatar ? 'Custom' : 'Default', inline: true },
            { name: '📊 Statistics', value: '━━━━━━━━━━━', inline: false },
            { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Channels', value: `${client.channels.cache.size}`, inline: true },
            { name: 'Commands', value: `${client.commands.size}`, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Shard', value: '0', inline: true },
            { name: 'Memory Usage', value: `${memoryUsage}% (${usedMemory.toFixed(2)}/${totalMemory.toFixed(2)} GB)`, inline: true },
            { name: 'Node.js Version', value: process.version, inline: true },
            { name: 'Discord.js Version', value: version, inline: true }
        )
        .setFooter({ text: `ID: ${bot.id}` })
        .setTimestamp();

    return embed;
}
