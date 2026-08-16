const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const os = require('os');

/**
 * Format milliseconds into a readable time string
 * @param {number} ms - Milliseconds to format
 * @returns {string} Formatted time string
 */
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Get status emoji for a user's presence
 * @param {string} status - Status string
 * @returns {string} Emoji for the status
 */
function getStatusEmoji(status) {
    const emojis = {
        online: '🟢',
        idle: '🟡',
        dnd: '🔴',
        offline: '⚫'
    };
    return emojis[status] || '⚫';
}

/**
 * Format status text with emoji
 * @param {string} status - Status string
 * @returns {string} Formatted status with emoji
 */
function formatStatus(status) {
    const emoji = getStatusEmoji(status);
    const text = status.charAt(0).toUpperCase() + status.slice(1);
    return `${emoji} ${text}`;
}

/**
 * Truncate text if it exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 1000) {
    if (!text) return 'None';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a list of items with truncation
 * @param {Array} items - Array of items to format
 * @param {number} maxItems - Maximum items to show
 * @param {Function} formatter - Function to format each item
 * @returns {string} Formatted list
 */
function formatList(items, maxItems = 10, formatter = (item) => item) {
    if (!items || items.length === 0) return 'None';
    
    const formatted = items.slice(0, maxItems).map(formatter);
    if (items.length > maxItems) {
        formatted.push(`... (+${items.length - maxItems} more)`);
    }
    return formatted.join(', ');
}

/**
 * Create a standardized error embed
 * @param {string} title - Error title
 * @param {string} description - Error description
 * @returns {EmbedBuilder} Error embed
 */
function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setColor(config.colors.danger)
        .setTimestamp();
}

/**
 * Create a standardized success embed
 * @param {string} title - Success title
 * @param {string} description - Success description
 * @returns {EmbedBuilder} Success embed
 */
function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setColor(config.colors.success)
        .setTimestamp();
}

/**
 * Get system information
 * @returns {Object} System info object
 */
function getSystemInfo() {
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024 / 1024;
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
    const cpuUsage = os.loadavg()[0].toFixed(2);
    
    return {
        totalMemory: totalMemory.toFixed(2),
        freeMemory: freeMemory.toFixed(2),
        usedMemory: usedMemory.toFixed(2),
        memoryUsage: memoryUsage,
        cpuUsage: cpuUsage,
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpus: os.cpus().length
    };
}

/**
 * Format a user's profile information
 * @param {object} user - Discord user object
 * @param {object} member - Discord member object (optional)
 * @returns {Object} Formatted user info
 */
function formatUserInfo(user, member = null) {
    const created = Math.floor(user.createdTimestamp / 1000);
    const joined = member ? Math.floor(member.joinedTimestamp / 1000) : null;
    const status = user.presence?.status || 'offline';
    
    return {
        username: user.username,
        discriminator: user.discriminator,
        displayName: member?.displayName || user.username,
        id: user.id,
        isBot: user.bot,
        status: formatStatus(status),
        created: `<t:${created}:F>`,
        createdRelative: `<t:${created}:R>`,
        joined: joined ? `<t:${joined}:F>` : 'N/A',
        joinedRelative: joined ? `<t:${joined}:R>` : 'N/A',
        avatarURL: user.displayAvatarURL({ dynamic: true, size: 1024 }),
        bannerURL: user.bannerURL({ dynamic: true, size: 1024 }),
        avatarType: user.avatar ? 'Custom' : 'Default',
        roles: member ? member.roles.cache.filter(r => r.id !== member.guild.id) : [],
        highestRole: member?.roles?.highest?.name || 'None',
        permissions: member?.permissions?.toArray() || [],
        isBoosting: !!member?.premiumSince,
        boostingSince: member?.premiumSince ? Math.floor(member.premiumSinceTimestamp / 1000) : null
    };
}

/**
 * Format bot information
 * @param {object} bot - Discord user object for bot
 * @param {object} client - Discord client
 * @returns {Object} Formatted bot info
 */
function formatBotInfo(bot, client) {
    const created = Math.floor(bot.createdTimestamp / 1000);
    const sysInfo = getSystemInfo();
    
    return {
        name: bot.username,
        discriminator: bot.discriminator,
        id: bot.id,
        isVerified: true,
        created: `<t:${created}:F>`,
        createdRelative: `<t:${created}:R>`,
        avatarURL: bot.displayAvatarURL({ dynamic: true, size: 1024 }),
        bannerURL: bot.bannerURL({ dynamic: true, size: 1024 }),
        avatarType: bot.avatar ? 'Custom' : 'Default',
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        channels: client.channels.cache.size,
        commands: client.commands.size,
        ping: client.ws.ping,
        shard: '0',
        memoryUsage: sysInfo.memoryUsage,
        memoryUsed: sysInfo.usedMemory,
        memoryTotal: sysInfo.totalMemory,
        nodeVersion: sysInfo.nodeVersion,
        discordVersion: require('discord.js').version,
        platform: sysInfo.platform,
        arch: sysInfo.arch,
        cpus: sysInfo.cpus,
        uptime: formatUptime(client.uptime)
    };
}

/**
 * Format server information
 * @param {object} guild - Discord guild object
 * @param {object} client - Discord client
 * @returns {Object} Formatted server info
 */
function formatServerInfo(guild, client) {
    const created = Math.floor(guild.createdTimestamp / 1000);
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;
    const categories = channels.filter(c => c.type === 4).size;
    const stageChannels = channels.filter(c => c.type === 13).size;
    
    return {
        name: guild.name,
        id: guild.id,
        ownerId: guild.ownerId,
        created: `<t:${created}:F>`,
        createdRelative: `<t:${created}:R>`,
        region: guild.preferredLocale || 'N/A',
        memberCount: guild.memberCount,
        totalChannels: channels.size,
        textChannels: textChannels,
        voiceChannels: voiceChannels,
        categories: categories,
        stageChannels: stageChannels,
        roles: guild.roles.cache.size - 1,
        emojis: guild.emojis.cache.size,
        stickers: guild.stickers.cache.size,
        boostLevel: guild.premiumTier || 0,
        boosts: guild.premiumSubscriptionCount || 0,
        iconURL: guild.iconURL({ dynamic: true, size: 1024 }),
        bannerURL: guild.bannerURL({ dynamic: true, size: 1024 })
    };
}

/**
 * Format role information
 * @param {object} role - Discord role object
 * @returns {Object} Formatted role info
 */
function formatRoleInfo(role) {
    const permissions = role.permissions.toArray();
    
    return {
        name: role.name,
        id: role.id,
        color: role.hexColor || 'None',
        position: role.position,
        members: role.members.size,
        permissionCount: permissions.length,
        isHoist: role.hoist,
        isMentionable: role.mentionable,
        isManaged: role.managed,
        permissions: permissions,
        createdAt: Math.floor(role.createdTimestamp / 1000)
    };
}

/**
 * Check if a user is a bot
 * @param {object} user - Discord user object
 * @returns {boolean} True if user is a bot
 */
function isBot(user) {
    return user?.bot || false;
}

/**
 * Safely fetch a user
 * @param {object} client - Discord client
 * @param {string} id - User ID
 * @returns {Promise<object|null>} User object or null
 */
async function safeFetchUser(client, id) {
    try {
        return await client.users.fetch(id);
    } catch (error) {
        return null;
    }
}

/**
 * Safely fetch a member
 * @param {object} guild - Discord guild
 * @param {string} id - Member ID
 * @returns {Promise<object|null>} Member object or null
 */
async function safeFetchMember(guild, id) {
    try {
        return await guild.members.fetch(id);
    } catch (error) {
        return null;
    }
}

/**
 * Create a paginated embed for long lists
 * @param {Array} items - List of items to paginate
 * @param {string} title - Embed title
 * @param {number} itemsPerPage - Items per page
 * @param {Function} formatter - Function to format each item
 * @returns {Array} Array of embeds
 */
function createPaginatedEmbeds(items, title, itemsPerPage = 20, formatter = (item) => item) {
    const embeds = [];
    const pages = Math.ceil(items.length / itemsPerPage);
    
    for (let i = 0; i < pages; i++) {
        const start = i * itemsPerPage;
        const end = Math.min(start + itemsPerPage, items.length);
        const pageItems = items.slice(start, end);
        
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(config.colors.primary)
            .setDescription(pageItems.map(formatter).join('\n'))
            .setFooter({ text: `Page ${i + 1}/${pages} | Total: ${items.length} items` })
            .setTimestamp();
        
        embeds.push(embed);
    }
    
    return embeds;
}

/**
 * Validate a command name
 * @param {string} commandName - Command name to validate
 * @returns {boolean} True if valid
 */
function isValidCommandName(commandName) {
    return /^[a-z0-9-]+$/.test(commandName);
}

/**
 * Get command from collection safely
 * @param {object} commands - Command collection
 * @param {string} name - Command name
 * @returns {object|null} Command object or null
 */
function getCommand(commands, name) {
    return commands.get(name) || null;
}

module.exports = {
    formatUptime,
    getStatusEmoji,
    formatStatus,
    truncateText,
    formatList,
    createErrorEmbed,
    createSuccessEmbed,
    getSystemInfo,
    formatUserInfo,
    formatBotInfo,
    formatServerInfo,
    formatRoleInfo,
    isBot,
    safeFetchUser,
    safeFetchMember,
    createPaginatedEmbeds,
    isValidCommandName,
    getCommand
};
