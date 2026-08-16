/**
 * Command aliases and variations
 * This file handles all the different command name variations
 */

const commandAliases = {
    // Help command variations
    help: ['help', 'commands', 'cmds', 'h', '?'],
    
    // Ping command variations
    ping: ['ping', 'pong', 'latency', 'lag'],
    
    // Uptime command variations
    uptime: ['uptime', 'up', 'online'],
    
    // Status command variations
    status: ['status', 'stats', 'info', 'botstatus', 'serverstatus'],
    
    // Reload command variations
    reload: ['reload', 'refresh', 'restartcmd', 'rc'],
    
    // User lookup variations
    userlookup: ['userlookup', 'lookupuser', 'user', 'ul'],
    
    // Bot lookup variations
    botlookup: ['botlookup', 'lookupbot', 'bot', 'bl'],
    
    // Get user ID variations
    getuserid: ['getuserid', 'userid', 'uid', 'iduser'],
    
    // Get bot ID variations
    getbotid: ['getbotid', 'botid', 'bid', 'idbot'],
    
    // Emoji list variations
    emojilist: ['emojilist', 'emojis', 'emotes', 'emotelist'],
    
    // Stickers list variations
    stickerslist: ['stickerslist', 'stickers', 'sticker'],
    
    // Role list variations
    rolelist: ['rolelist', 'roles', 'rl'],
    
    // Role info variations
    roleinfo: ['roleinfo', 'role', 'ri'],
    
    // Server info variations
    serverinfo: ['serverinfo', 'server', 'si', 'guildinfo', 'guild'],
    
    // User info variations
    userinfo: ['userinfo', 'user', 'ui'],
    
    // Bot info variations
    botinfo: ['botinfo', 'bot', 'bi']
};

/**
 * Get the main command name from an alias
 * @param {string} alias - The alias to look up
 * @returns {string|null} - The main command name or null if not found
 */
function getMainCommand(alias) {
    const lowerAlias = alias.toLowerCase();
    
    for (const [mainCommand, aliases] of Object.entries(commandAliases)) {
        if (aliases.includes(lowerAlias)) {
            return mainCommand;
        }
    }
    
    return null;
}

/**
 * Get all aliases for a specific command
 * @param {string} commandName - The main command name
 * @returns {Array} - Array of aliases
 */
function getCommandAliases(commandName) {
    return commandAliases[commandName] || [];
}

/**
 * Check if a command name is valid
 * @param {string} commandName - The command name to check
 * @returns {boolean} - True if valid
 */
function isValidCommand(commandName) {
    return commandAliases.hasOwnProperty(commandName);
}

/**
 * Get all command names (main ones only)
 * @returns {Array} - Array of all main command names
 */
function getAllCommandNames() {
    return Object.keys(commandAliases);
}

/**
 * Get a formatted list of commands with their aliases
 * @returns {Object} - Object with command names and their aliases
 */
function getCommandList() {
    const list = {};
    
    for (const [mainCommand, aliases] of Object.entries(commandAliases)) {
        list[mainCommand] = {
            main: mainCommand,
            aliases: aliases,
            display: aliases.join(', ')
        };
    }
    
    return list;
}

/**
 * Format a command name for display
 * @param {string} commandName - The command name
 * @returns {string} - Formatted display name
 */
function formatCommandName(commandName) {
    const formatted = commandName.charAt(0).toUpperCase() + commandName.slice(1);
    return formatted.replace(/([A-Z])/g, ' $1').trim();
}

module.exports = {
    commandAliases,
    getMainCommand,
    getCommandAliases,
    isValidCommand,
    getAllCommandNames,
    getCommandList,
    formatCommandName
};
