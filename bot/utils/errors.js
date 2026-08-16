/**
 * Error handling utility
 * Centralized error management and logging
 */

const { EmbedBuilder } = require('discord.js');
const colors = require('./colors').colors;

// Custom error classes
class BotError extends Error {
    constructor(message, code = 'BOT_ERROR', details = null) {
        super(message);
        this.name = 'BotError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class CommandError extends BotError {
    constructor(message, commandName, details = null) {
        super(message, 'COMMAND_ERROR', details);
        this.commandName = commandName;
        this.name = 'CommandError';
    }
}

class PermissionError extends BotError {
    constructor(message, requiredPermissions, details = null) {
        super(message, 'PERMISSION_ERROR', details);
        this.requiredPermissions = requiredPermissions;
        this.name = 'PermissionError';
    }
}

class RateLimitError extends BotError {
    constructor(message, cooldown, details = null) {
        super(message, 'RATE_LIMIT_ERROR', details);
        this.cooldown = cooldown;
        this.name = 'RateLimitError';
    }
}

class APIError extends BotError {
    constructor(message, endpoint, status, details = null) {
        super(message, 'API_ERROR', details);
        this.endpoint = endpoint;
        this.status = status;
        this.name = 'APIError';
    }
}

/**
 * Create an error embed
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 * @returns {EmbedBuilder} - Error embed
 */
function createErrorEmbed(error, context = 'Unknown') {
    const embed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setColor(colors.danger)
        .addFields(
            { name: 'Error Type', value: error.name || 'Unknown', inline: true },
            { name: 'Code', value: error.code || 'UNKNOWN_ERROR', inline: true },
            { name: 'Context', value: context, inline: true },
            { name: 'Message', value: error.message || 'No error message', inline: false },
            { name: 'Timestamp', value: new Date().toISOString(), inline: true }
        )
        .setTimestamp();

    // Add details if available
    if (error.details) {
        const detailsStr = typeof error.details === 'object' 
            ? JSON.stringify(error.details, null, 2) 
            : String(error.details);
        embed.addFields({ name: 'Details', value: detailsStr.slice(0, 1024), inline: false });
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
        embed.addFields({ name: 'Stack Trace', value: `\`\`\`${error.stack.slice(0, 1024)}\`\`\``, inline: false });
    }

    return embed;
}

/**
 * Log error to console with formatting
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 */
function logError(error, context = 'Unknown') {
    console.error('\n' + '='.repeat(60));
    console.error(`❌ ERROR [${new Date().toISOString()}]`);
    console.error('─'.repeat(40));
    console.error(`  Context:     ${context}`);
    console.error(`  Type:        ${error.name || 'Unknown'}`);
    console.error(`  Code:        ${error.code || 'UNKNOWN_ERROR'}`);
    console.error(`  Message:     ${error.message}`);
    if (error.commandName) {
        console.error(`  Command:     ${error.commandName}`);
    }
    if (error.stack && process.env.NODE_ENV === 'development') {
        console.error(`\n  Stack Trace:\n${error.stack}`);
    }
    console.error('='.repeat(60) + '\n');
}

/**
 * Handle error and send response
 * @param {Error} error - The error object
 * @param {object} context - Message or Interaction context
 * @param {string} fallbackMessage - Message to show if embed fails
 */
async function handleError(error, context, fallbackMessage = 'An error occurred!') {
    logError(error, context?.guild?.name || 'Unknown');
    
    try {
        const embed = createErrorEmbed(error, context?.guild?.name || 'Unknown');
        if (context.reply) {
            await context.reply({ embeds: [embed] });
        } else if (context.reply && context.ephemeral) {
            await context.reply({ embeds: [embed], ephemeral: true });
        } else {
            await context.channel?.send({ embeds: [embed] });
        }
    } catch (e) {
        // Fallback if embed fails
        try {
            if (context.reply) {
                await context.reply(fallbackMessage);
            } else {
                await context.channel?.send(fallbackMessage);
            }
        } catch (e2) {
            console.error('Failed to send error message:', e2);
        }
    }
}

/**
 * Check if an error is a specific type
 * @param {Error} error - The error object
 * @param {string} type - The error type to check
 * @returns {boolean} - True if error matches type
 */
function isErrorType(error, type) {
    return error.name === type || error.code === type || error instanceof type;
}

module.exports = {
    BotError,
    CommandError,
    PermissionError,
    RateLimitError,
    APIError,
    createErrorEmbed,
    logError,
    handleError,
    isErrorType
};
