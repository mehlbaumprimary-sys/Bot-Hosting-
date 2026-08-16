/**
 * All bot constants in one place
 * Easy to manage and update
 */

const { version } = require('discord.js');

module.exports = {
    // Bot Information
    BOT: {
        NAME: 'Advanced Discord Bot',
        VERSION: '2.0.0',
        DESCRIPTION: 'An advanced Discord bot with 18+ commands',
        AUTHOR: 'Your Name',
        REPOSITORY: 'https://github.com/yourusername/discord-advanced-bot',
        WEBSITE: 'https://yourwebsite.com'
    },

    // Discord Limits
    LIMITS: {
        MAX_MESSAGE_LENGTH: 2000,
        MAX_EMBED_LENGTH: 6000,
        MAX_EMBED_DESCRIPTION: 4096,
        MAX_EMBED_FIELDS: 25,
        MAX_EMBED_FIELD_NAME: 256,
        MAX_EMBED_FIELD_VALUE: 1024,
        MAX_FILES: 10,
        MAX_FILE_SIZE: 8 * 1024 * 1024, // 8MB
        MAX_ROLE_NAME: 100,
        MAX_CHANNEL_NAME: 100,
        MAX_NICKNAME: 32,
        MAX_USERNAME: 32
    },

    // Time Constants (in milliseconds)
    TIME: {
        SECOND: 1000,
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 60 * 60 * 1000,
        WEEK: 7 * 24 * 60 * 60 * 1000,
        MONTH: 30 * 24 * 60 * 60 * 1000,
        YEAR: 365 * 24 * 60 * 60 * 1000
    },

    // Default Cooldowns (in milliseconds)
    COOLDOWNS: {
        DEFAULT: 5000,
        HELP: 3000,
        PING: 2000,
        STATUS: 3000,
        RELOAD: 30000,
        USER_LOOKUP: 5000,
        BOT_LOOKUP: 5000,
        SYSTEM_INFO: 5000,
        STATS: 5000,
        SERVER_INFO: 10000,
        USER_INFO: 5000,
        BOT_INFO: 5000
    },

    // Rate Limits
    RATE_LIMITS: {
        DEFAULT_MAX_USES: 10,
        DEFAULT_TIME_WINDOW: 60000,
        HELP_MAX_USES: 20,
        PING_MAX_USES: 30,
        RELOAD_MAX_USES: 5,
        USER_LOOKUP_MAX_USES: 15,
        BOT_LOOKUP_MAX_USES: 15
    },

    // Status Messages
    STATUS_MESSAGES: [
        '🚀 Always improving...',
        '💻 Made with ❤️',
        '✨ Online & Ready!',
        '🎮 ~-help for commands',
        '📊 Managing servers',
        '⚡ Fast & Reliable',
        '🌟 Community bot',
        '🔧 Constantly updated'
    ],

    // Emojis
    EMOJIS: {
        ONLINE: '🟢',
        IDLE: '🟡',
        DND: '🔴',
        OFFLINE: '⚫',
        STREAMING: '🔴',
        SUCCESS: '✅',
        ERROR: '❌',
        WARNING: '⚠️',
        INFO: 'ℹ️',
        LOADING: '⏳',
        PING: '🏓',
        UPTIME: '⏱️',
        STATUS: '📊',
        RELOAD: '🔄',
        LOOKUP: '🔍',
        BOT: '🤖',
        ID: '🆔',
        EMOJI: '🎨',
        STICKER: '🎨',
        ROLE: '🔰',
        SERVER: '🏠',
        USER: '👤',
        SYSTEM: '🖥️',
        VERSION: '📦',
        STATS: '📊',
        HELP: '📋',
        PERMISSION: '🔐'
    },

    // Discord API endpoints
    API: {
        BASE_URL: 'https://discord.com/api/v10',
        CDN_URL: 'https://cdn.discordapp.com'
    },

    // Default Embed Colors
    COLORS: {
        PRIMARY: '#5865F2',
        SUCCESS: '#57F287',
        WARNING: '#FEE75C',
        DANGER: '#ED4245',
        INFO: '#5865F2',
        BLURPLE: '#5865F2',
        GREEN: '#57F287',
        YELLOW: '#FEE75C',
        RED: '#ED4245',
        FUCHSIA: '#EB459E',
        WHITE: '#FFFFFF',
        BLACK: '#000000',
        GRAY: '#80848E'
    },

    // Default Permissions
    PERMISSIONS: {
        ADMIN: ['Administrator', 'ManageGuild', 'ManageChannels', 'ManageRoles'],
        MODERATOR: ['KickMembers', 'BanMembers', 'ModerateMembers', 'ManageMessages'],
        MEMBER: ['SendMessages', 'ReadMessageHistory', 'AddReactions']
    }
};
