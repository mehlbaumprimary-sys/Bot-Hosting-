const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const helpers = require('../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays all available commands'),
    
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('📋 Command List')
            .setDescription('Here are all available commands:')
            .setColor('#5865F2')
            .addFields(
                { name: 'General Commands', value: 
                    '`~-help` - Displays this help menu (aliases: ~-commands, ~-cmds, ~-h, ~-?)\n' +
                    '`~-ping` - Shows bot ping and stats (aliases: ~-pong, ~-latency, ~-lag)\n' +
                    '`~-uptime` - Shows bot uptime (aliases: ~-up, ~-online)\n' +
                    '`~-status` - Shows detailed bot status (aliases: ~-stats, ~-info)\n' +
                    '`~-reload [command]` - Reloads a specific command (aliases: ~-refresh, ~-rc)' },
                { name: 'Information Commands', value: 
                    '`~-userlookup [user]` - Gets detailed user info (aliases: ~-lookupuser, ~-ul)\n' +
                    '`~-botlookup [bot]` - Gets detailed bot info (aliases: ~-lookupbot, ~-bl)\n' +
                    '`~-getuserid [user]` - Gets user ID (aliases: ~-userid, ~-uid)\n' +
                    '`~-getbotid [bot]` - Gets bot ID (aliases: ~-botid, ~-bid)' },
                { name: 'Server Commands', value: 
                    '`~-emojilist` - Lists all server emojis (aliases: ~-emojis, ~-emotes)\n' +
                    '`~-stickerslist` - Lists all server stickers (aliases: ~-stickers)\n' +
                    '`~-rolelist` - Lists all server roles (aliases: ~-roles, ~-rl)\n' +
                    '`~-roleinfo [role]` - Gets role info (aliases: ~-role, ~-ri)\n' +
                    '`~-serverinfo` - Gets server info (aliases: ~-server, ~-si)' },
                { name: 'User Commands', value: 
                    '`~-userinfo [user]` - Gets detailed user info (20 items) (aliases: ~-user, ~-ui)\n' +
                    '`~-botinfo [bot]` - Gets detailed bot info (20 items) (aliases: ~-bot, ~-bi)' }
            )
            .setFooter({ text: `Prefix: ${process.env.PREFIX || '~-'} | Total Commands: 15` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📋 Command List')
            .setDescription('Here are all available commands:')
            .setColor('#5865F2')
            .addFields(
                { name: 'General Commands', value: 
                    '`/help` - Displays this help menu\n' +
                    '`/ping` - Shows bot ping and stats\n' +
                    '`/uptime` - Shows bot uptime\n' +
                    '`/status` - Shows detailed bot status\n' +
                    '`/reload [command]` - Reloads a specific command' },
                { name: 'Information Commands', value: 
                    '`/userlookup [user]` - Gets detailed user info\n' +
                    '`/botlookup [bot]` - Gets detailed bot info\n' +
                    '`/getuserid [user]` - Gets user ID\n' +
                    '`/getbotid [bot]` - Gets bot ID' },
                { name: 'Server Commands', value: 
                    '`/emojilist` - Lists all server emojis\n' +
                    '`/stickerslist` - Lists all server stickers\n' +
                    '`/rolelist` - Lists all server roles\n' +
                    '`/roleinfo [role]` - Gets role info\n' +
                    '`/serverinfo` - Gets server info' },
                { name: 'User Commands', value: 
                    '`/userinfo [user]` - Gets detailed user info (20 items)\n' +
                    '`/botinfo [bot]` - Gets detailed bot info (20 items)' }
            )
            .setFooter({ text: `Total Commands: 15` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
