/**
 * Permission management utility
 * Check and manage user permissions
 */

const { PermissionsBitField } = require('discord.js');

// Permission categories
const PERMISSION_CATEGORIES = {
    ADMIN: [
        'Administrator',
        'ManageGuild',
        'ManageChannels',
        'ManageRoles',
        'ManageMessages',
        'ManageWebhooks',
        'ManageEmojisAndStickers'
    ],
    MODERATION: [
        'KickMembers',
        'BanMembers',
        'ModerateMembers',
        'MuteMembers',
        'DeafenMembers',
        'MoveMembers',
        'ManageMessages'
    ],
    CHANNEL: [
        'ManageChannels',
        'ManageWebhooks',
        'ManageThreads',
        'CreateInstantInvite',
        'CreatePublicThreads',
        'CreatePrivateThreads'
    ],
    MESSAGE: [
        'SendMessages',
        'SendMessagesInThreads',
        'SendTTSMessages',
        'ManageMessages',
        'EmbedLinks',
        'AttachFiles',
        'AddReactions',
        'UseExternalEmojis',
        'UseExternalStickers',
        'MentionEveryone'
    ],
    VOICE: [
        'Connect',
        'Speak',
        'Stream',
        'UseVoiceActivity',
        'PrioritySpeaker',
        'UseVAD'
    ],
    ROLE: [
        'ManageRoles',
        'ManageNicknames'
    ],
    SERVER: [
        'ManageGuild',
        'ManageGuildExpressions',
        'ManageGuildConfig',
        'ManageEvent'
    ],
    OTHER: [
        'ViewAuditLog',
        'ViewGuildInsights',
        'UseEmbeddedActivities',
        'UseSoundboard',
        'CreateEvents',
        'RequestToSpeak'
    ]
};

// Permission levels
const PERMISSION_LEVELS = {
    OWNER: 5,
    ADMIN: 4,
    MODERATOR: 3,
    MEMBER: 2,
    USER: 1,
    GUEST: 0
};

/**
 * Check if a user has permission
 * @param {object} user - User object
 * @param {string|Array} permission - Permission(s) to check
 * @param {object} guild - Guild object
 * @returns {boolean} - True if user has permission
 */
function hasPermission(user, permission, guild) {
    if (!user || !guild) return false;
    
    const member = guild.members.cache.get(user.id);
    if (!member) return false;
    
    // Owner has all permissions
    if (member.id === guild.ownerId) return true;
    
    // Check if user has permission
    if (Array.isArray(permission)) {
        return permission.some(p => member.permissions.has(p));
    }
    
    return member.permissions.has(permission);
}

/**
 * Get all permissions a user has
 * @param {object} user - User object
 * @param {object} guild - Guild object
 * @returns {Array} - Array of permission names
 */
function getPermissions(user, guild) {
    if (!user || !guild) return [];
    
    const member = guild.members.cache.get(user.id);
    if (!member) return [];
    
    return member.permissions.toArray();
}

/**
 * Check if user has permission level
 * @param {object} user - User object
 * @param {object} guild - Guild object
 * @param {number} level - Permission level
 * @param {Array} adminUsers - Admin user IDs
 * @returns {boolean} - True if user has level
 */
function hasPermissionLevel(user, guild, level, adminUsers = []) {
    if (!user || !guild) return false;
    
    const member = guild.members.cache.get(user.id);
    if (!member) return false;
    
    // Owner
    if (member.id === guild.ownerId) return true;
    
    // Check admin list
    if (adminUsers.includes(user.id)) return true;
    
    // Check by role permissions
    const permissions = member.permissions.toArray();
    
    if (level === PERMISSION_LEVELS.ADMIN) {
        return permissions.some(p => PERMISSION_CATEGORIES.ADMIN.includes(p));
    }
    
    if (level === PERMISSION_LEVELS.MODERATOR) {
        return permissions.some(p => PERMISSION_CATEGORIES.MODERATION.includes(p));
    }
    
    if (level === PERMISSION_LEVELS.MEMBER) {
        return permissions.some(p => PERMISSION_CATEGORIES.MESSAGE.includes(p));
    }
    
    return true;
}

/**
 * Get missing permissions for a user
 * @param {object} user - User object
 * @param {object} guild - Guild object
 * @param {Array} requiredPermissions - Required permissions
 * @returns {Array} - Missing permissions
 */
function getMissingPermissions(user, guild, requiredPermissions) {
    if (!user || !guild) return requiredPermissions || [];
    
    const member = guild.members.cache.get(user.id);
    if (!member) return requiredPermissions || [];
    
    if (member.id === guild.ownerId) return [];
    
    return requiredPermissions.filter(p => !member.permissions.has(p));
}

/**
 * Format permissions for display
 * @param {Array} permissions - Array of permission names
 * @param {number} maxDisplay - Maximum to display
 * @returns {string} - Formatted permission string
 */
function formatPermissions(permissions, maxDisplay = 10) {
    if (!permissions || permissions.length === 0) return 'None';
    
    const formatted = permissions
        .filter(p => p !== 'Administrator')
        .map(p => p.replace(/([A-Z])/g, ' $1').trim())
        .slice(0, maxDisplay);
    
    if (permissions.length > maxDisplay) {
        return `${formatted.join(', ')}... (+${permissions.length - maxDisplay} more)`;
    }
    
    return formatted.join(', ');
}

/**
 * Check if user can manage a role
 * @param {object} user - User object
 * @param {object} role - Role object
 * @param {object} guild - Guild object
 * @returns {boolean} - True if user can manage role
 */
function canManageRole(user, role, guild) {
    if (!user || !role || !guild) return false;
    
    const member = guild.members.cache.get(user.id);
    if (!member) return false;
    
    if (member.id === guild.ownerId) return true;
    if (!member.permissions.has('ManageRoles')) return false;
    
    // Can't manage roles higher than their highest role
    const highestRole = member.roles.highest;
    return highestRole.position > role.position;
}

/**
 * Get user's permission category
 * @param {object} user - User object
 * @param {object} guild - Guild object
 * @returns {string} - Permission category
 */
function getPermissionCategory(user, guild) {
    if (!user || !guild) return 'User';
    
    const member = guild.members.cache.get(user.id);
    if (!member) return 'User';
    
    if (member.id === guild.ownerId) return 'Owner';
    
    const permissions = member.permissions.toArray();
    
    if (permissions.some(p => PERMISSION_CATEGORIES.ADMIN.includes(p))) {
        return 'Administrator';
    }
    
    if (permissions.some(p => PERMISSION_CATEGORIES.MODERATION.includes(p))) {
        return 'Moderator';
    }
    
    return 'Member';
}

/**
 * Create a permission embed
 * @param {object} user - User object
 * @param {object} guild - Guild object
 * @returns {object} - Embed object
 */
function createPermissionEmbed(user, guild) {
    const { EmbedBuilder } = require('discord.js');
    const member = guild.members.cache.get(user.id);
    if (!member) return null;
    
    const permissions = member.permissions.toArray();
    const category = getPermissionCategory(user, guild);
    const isOwner = member.id === guild.ownerId;
    
    const embed = new EmbedBuilder()
        .setTitle('🔐 User Permissions')
        .setDescription(`Permissions for ${user.tag}`)
        .setColor(isOwner ? '#FFD700' : '#5865F2')
        .addFields(
            { name: 'Category', value: category, inline: true },
            { name: 'Is Owner', value: isOwner ? '✅ Yes' : '❌ No', inline: true },
            { name: 'Permissions Count', value: `${permissions.length}`, inline: true },
            { name: 'Permissions', value: formatPermissions(permissions), inline: false }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
    
    return embed;
}

module.exports = {
    PERMISSION_CATEGORIES,
    PERMISSION_LEVELS,
    hasPermission,
    getPermissions,
    hasPermissionLevel,
    getMissingPermissions,
    formatPermissions,
    canManageRole,
    getPermissionCategory,
    createPermissionEmbed
};
