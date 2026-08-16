const { EmbedBuilder } = require('discord.js');
const config = require('../config');

class Helpers {
    /**
     * Format uptime from milliseconds to readable string
     */
    static formatUptime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
        
        return parts.join(' ');
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Truncate text with ellipsis
     */
    static truncate(text, maxLength = 1000) {
        if (!text) return 'None';
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3) + '...';
    }

    /**
     * Get status emoji for presence status
     */
    static getStatusEmoji(status) {
        const emojis = {
            online: '🟢',
            idle: '🟡',
            dnd: '🔴',
            offline: '⚫'
        };
        return emojis[status] || '⚫';
    }

    /**
     * Capitalize first letter of string
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Get user avatar URL with options
     */
    static getAvatarURL(user, size = 1024) {
        return user.displayAvatarURL({ dynamic: true, size });
    }

    /**
     * Check if a string is a valid Discord ID
     */
    static isValidDiscordID(id) {
        return /^\d{17,19}$/.test(id);
    }

    /**
     * Parse user mention or ID
     */
    static parseUserMention(text) {
        if (!text) return null;
        const match = text.match(/^<@!?(\d+)>$/);
        if (match) return match[1];
        if (this.isValidDiscordID(text)) return text;
        return null;
    }

    /**
     * Parse role mention or ID
     */
    static parseRoleMention(text) {
        if (!text) return null;
        const match = text.match(/^<@&(\d+)>$/);
        if (match) return match[1];
        if (this.isValidDiscordID(text)) return text;
        return null;
    }

    /**
     * Get command aliases mapping
     */
    static getCommandAliases() {
        return {
            'help': ['help', 'commands', 'cmds', 'h'],
            'ping': ['ping', 'pong'],
            'uptime': ['uptime', 'up'],
            'status': ['status', 'stats'],
            'reload': ['reload', 'rl'],
            'userlookup': ['userlookup', 'ul', 'user'],
            'botlookup': ['botlookup', 'bl', 'bot'],
            'getuserid': ['getuserid', 'uid', 'userid'],
            'getbotid': ['getbotid', 'bid', 'botid'],
            'emojilist': ['emojilist', 'emojis', 'emoji'],
            'stickerslist': ['stickerslist', 'stickers', 'sticker'],
            'rolelist': ['rolelist', 'roles', 'rl'],
            'roleinfo': ['roleinfo', 'ri', 'role'],
            'serverinfo': ['serverinfo', 'server', 'si'],
            'userinfo': ['userinfo', 'ui', 'userinfo'],
            'botinfo': ['botinfo', 'bi', 'botinfo']
        };
    }

    /**
     * Get command category mapping
     */
    static getCommandCategories() {
        return {
            'General': ['help', 'ping', 'uptime', 'status', 'reload'],
            'Information': ['userlookup', 'botlookup', 'getuserid', 'getbotid'],
            'Server': ['emojilist', 'stickerslist', 'rolelist', 'roleinfo', 'serverinfo'],
            'User': ['userinfo', 'botinfo']
        };
    }

    /**
     * Get command description
     */
    static getCommandDescription(commandName) {
        const descriptions = {
            'help': 'Displays all available commands',
            'ping': 'Shows bot ping and statistics',
            'uptime': 'Shows bot uptime information',
            'status': 'Shows detailed bot status',
            'reload': 'Reloads a specific command',
            'userlookup': 'Looks up detailed user information',
            'botlookup': 'Looks up detailed bot information',
            'getuserid': 'Gets the ID of a specific user',
            'getbotid': 'Gets the ID of a specific bot',
            'emojilist': 'Displays all server emojis',
            'stickerslist': 'Displays all server stickers',
            'rolelist': 'Lists all server roles',
            'roleinfo': 'Gets detailed role information',
            'serverinfo': 'Gets detailed server information',
            'userinfo': 'Gets detailed user information (20 items)',
            'botinfo': 'Gets detailed bot information (20 items)'
        };
        return descriptions[commandName] || 'No description available';
    }

    /**
     * Get command usage
     */
    static getCommandUsage(commandName) {
        const usage = {
            'help': '~-help or ~-commands or ~-cmds',
            'ping': '~-ping',
            'uptime': '~-uptime',
            'status': '~-status',
            'reload': '~-reload <command>',
            'userlookup': '~-userlookup <user>',
            'botlookup': '~-botlookup <bot>',
            'getuserid': '~-getuserid <user>',
            'getbotid': '~-getbotid <bot>',
            'emojilist': '~-emojilist',
            'stickerslist': '~-stickerslist',
            'rolelist': '~-rolelist',
            'roleinfo': '~-roleinfo <role>',
            'serverinfo': '~-serverinfo',
            'userinfo': '~-userinfo <user>',
            'botinfo': '~-botinfo <bot>'
        };
        return usage[commandName] || 'No usage available';
    }

    /**
     * Create a help embed with different versions
     */
    static createHelpEmbed(client, version = 'full') {
        const embed = new EmbedBuilder()
            .setTitle('📋 Command List')
            .setColor(config.colors.primary)
            .setFooter({ text: `Prefix: ${config.prefix} | Total: ${client.commands.size} commands` })
            .setTimestamp();

        const categories = this.getCommandCategories();

        if (version === 'full') {
            embed.setDescription('Here are all available commands with their descriptions:');
            
            for (const [category, commands] of Object.entries(categories)) {
                const commandList = commands.map(cmd => {
                    const aliases = this.getCommandAliases()[cmd];
                    const aliasStr = aliases && aliases.length > 1 
                        ? ` (aliases: ${aliases.filter(a => a !== cmd).join(', ')})` 
                        : '';
                    return `\`${config.prefix}${cmd}\`${aliasStr} - ${this.getCommandDescription(cmd)}`;
                }).join('\n');
                
                embed.addFields({ 
                    name: `📁 ${category}`, 
                    value: commandList || 'No commands', 
                    inline: false 
                });
            }
        } else if (version === 'simple') {
            embed.setDescription('Quick command reference:');
            
            const allCommands = Object.keys(this.getCommandAliases());
            const commandList = allCommands.map(cmd => {
                const aliases = this.getCommandAliases()[cmd];
                const aliasStr = aliases && aliases.length > 1 
                    ? ` (${aliases.filter(a => a !== cmd).join(', ')})` 
                    : '';
                return `\`${config.prefix}${cmd}\`${aliasStr}`;
            }).join(', ');
            
            embed.addFields({ 
                name: 'All Commands', 
                value: this.truncate(commandList, 1000), 
                inline: false 
            });
        } else if (version === 'compact') {
            embed.setDescription('Compact command list:');
            
            const allCommands = Object.keys(this.getCommandAliases());
            const commandList = allCommands.map(cmd => {
                const aliases = this.getCommandAliases()[cmd];
                const primaryAlias = aliases ? aliases[0] : cmd;
                return `\`${config.prefix}${primaryAlias}\``;
            }).join(' ');
            
            embed.addFields({ 
                name: 'Commands', 
                value: this.truncate(commandList, 1000), 
                inline: false 
            });
        }

        return embed;
    }

    /**
     * Get category for a command
     */
    static getCommandCategory(commandName) {
        const categories = this.getCommandCategories();
        for (const [category, commands] of Object.entries(categories)) {
            if (commands.includes(commandName)) return category;
        }
        return 'Uncategorized';
    }

    /**
     * Check if a command name is valid (including aliases)
     */
    static isValidCommand(commandName) {
        const aliases = this.getCommandAliases();
        for (const [cmd, aliasList] of Object.entries(aliases)) {
            if (aliasList.includes(commandName)) return cmd;
        }
        return null;
    }

    /**
     * Get the main command name from an alias
     */
    static getMainCommand(alias) {
        const aliases = this.getCommandAliases();
        for (const [cmd, aliasList] of Object.entries(aliases)) {
            if (aliasList.includes(alias)) return cmd;
        }
        return null;
    }

    /**
     * Format a timestamp
     */
    static formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    /**
     * Get bot statistics
     */
    static getBotStats(client) {
        return {
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            channels: client.channels.cache.size,
            commands: client.commands.size,
            ping: client.ws.ping,
            uptime: this.formatUptime(client.uptime),
            memory: process.memoryUsage(),
            nodeVersion: process.version
        };
    }
}

module.exports = Helpers;
