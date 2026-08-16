/**
 * Rate limiting utility
 * Prevents command spam and abuse
 */

const { Collection } = require('discord.js');

class RateLimiter {
    constructor(options = {}) {
        this.defaultCooldown = options.defaultCooldown || 5000; // 5 seconds
        this.maxCooldown = options.maxCooldown || 60000; // 1 minute
        this.cooldowns = new Collection();
        this.globalCooldown = options.globalCooldown || 1000; // 1 second
        this.lastCommand = new Collection();
        this.commandLimits = new Map();
        
        // Default limits per command
        this.limits = new Map([
            ['default', { cooldown: 5000, maxUses: 10, timeWindow: 60000 }],
            ['help', { cooldown: 3000, maxUses: 20, timeWindow: 60000 }],
            ['ping', { cooldown: 2000, maxUses: 30, timeWindow: 60000 }],
            ['reload', { cooldown: 30000, maxUses: 5, timeWindow: 60000 }],
            ['userlookup', { cooldown: 5000, maxUses: 15, timeWindow: 60000 }],
            ['botlookup', { cooldown: 5000, maxUses: 15, timeWindow: 60000 }],
            ['status', { cooldown: 3000, maxUses: 20, timeWindow: 60000 }],
            ['systeminfo', { cooldown: 5000, maxUses: 10, timeWindow: 60000 }],
            ['stats', { cooldown: 5000, maxUses: 10, timeWindow: 60000 }]
        ]);
    }

    /**
     * Set custom limits for a command
     * @param {string} commandName - Name of the command
     * @param {object} limits - Limits object
     */
    setLimits(commandName, limits) {
        this.limits.set(commandName, {
            cooldown: limits.cooldown || this.defaultCooldown,
            maxUses: limits.maxUses || 10,
            timeWindow: limits.timeWindow || 60000
        });
    }

    /**
     * Get limits for a command
     * @param {string} commandName - Name of the command
     * @returns {object} - Limits object
     */
    getLimits(commandName) {
        return this.limits.get(commandName) || this.limits.get('default');
    }

    /**
     * Check if a user is rate limited
     * @param {string} userId - User ID
     * @param {string} commandName - Command name
     * @param {string} guildId - Guild ID (optional)
     * @returns {object} - { limited: boolean, timeLeft: number, message: string }
     */
    checkRateLimit(userId, commandName, guildId = null) {
        const limits = this.getLimits(commandName);
        const key = guildId ? `${guildId}-${userId}-${commandName}` : `${userId}-${commandName}`;
        
        // Check global cooldown
        const globalKey = `global-${userId}`;
        if (this.globalCooldown > 0) {
            const lastGlobal = this.lastCommand.get(globalKey);
            if (lastGlobal) {
                const timeSince = Date.now() - lastGlobal;
                if (timeSince < this.globalCooldown) {
                    return {
                        limited: true,
                        timeLeft: this.globalCooldown - timeSince,
                        message: `Please wait ${Math.ceil((this.globalCooldown - timeSince) / 1000)} seconds before using any command!`
                    };
                }
            }
            this.lastCommand.set(globalKey, Date.now());
        }

        // Get user's cooldown data
        let userCooldown = this.cooldowns.get(key);
        if (!userCooldown) {
            userCooldown = {
                lastUsed: 0,
                uses: 0,
                firstUse: 0
            };
            this.cooldowns.set(key, userCooldown);
        }

        const now = Date.now();
        const timeSinceLast = now - userCooldown.lastUsed;

        // Check cooldown
        if (timeSinceLast < limits.cooldown && userCooldown.uses > 0) {
            const timeLeft = limits.cooldown - timeSinceLast;
            return {
                limited: true,
                timeLeft: timeLeft,
                message: `Please wait ${Math.ceil(timeLeft / 1000)} seconds before using this command again!`
            };
        }

        // Reset usage if time window passed
        if (now - userCooldown.firstUse > limits.timeWindow) {
            userCooldown.uses = 0;
            userCooldown.firstUse = now;
        }

        // Check max uses
        if (userCooldown.uses >= limits.maxUses) {
            const timeLeft = limits.timeWindow - (now - userCooldown.firstUse);
            return {
                limited: true,
                timeLeft: timeLeft,
                message: `You've reached the maximum uses (${limits.maxUses}) for this command. Please wait ${Math.ceil(timeLeft / 1000)} seconds!`
            };
        }

        // Update usage
        userCooldown.uses++;
        userCooldown.lastUsed = now;
        if (userCooldown.firstUse === 0) {
            userCooldown.firstUse = now;
        }

        return {
            limited: false,
            timeLeft: 0,
            message: null
        };
    }

    /**
     * Reset cooldown for a user
     * @param {string} userId - User ID
     * @param {string} commandName - Command name (optional)
     * @param {string} guildId - Guild ID (optional)
     */
    resetCooldown(userId, commandName = null, guildId = null) {
        if (commandName) {
            const key = guildId ? `${guildId}-${userId}-${commandName}` : `${userId}-${commandName}`;
            this.cooldowns.delete(key);
        } else {
            // Remove all cooldowns for this user
            for (const [key] of this.cooldowns) {
                if (key.includes(userId)) {
                    this.cooldowns.delete(key);
                }
            }
        }
    }

    /**
     * Clear all cooldowns
     */
    clearAllCooldowns() {
        this.cooldowns.clear();
        this.lastCommand.clear();
    }

    /**
     * Get cooldown status for a user
     * @param {string} userId - User ID
     * @param {string} commandName - Command name
     * @param {string} guildId - Guild ID (optional)
     * @returns {object} - Cooldown status
     */
    getCooldownStatus(userId, commandName, guildId = null) {
        const key = guildId ? `${guildId}-${userId}-${commandName}` : `${userId}-${commandName}`;
        const userCooldown = this.cooldowns.get(key);
        
        if (!userCooldown) {
            return {
                hasCooldown: false,
                uses: 0,
                maxUses: this.getLimits(commandName).maxUses,
                timeUntilReset: 0
            };
        }

        const now = Date.now();
        const limits = this.getLimits(commandName);
        const timeUntilReset = limits.timeWindow - (now - userCooldown.firstUse);

        return {
            hasCooldown: true,
            uses: userCooldown.uses,
            maxUses: limits.maxUses,
            timeUntilReset: Math.max(0, timeUntilReset)
        };
    }

    /**
     * Get cooldown time left in seconds
     * @param {string} userId - User ID
     * @param {string} commandName - Command name
     * @param {string} guildId - Guild ID (optional)
     * @returns {number} - Time left in seconds
     */
    getTimeLeft(userId, commandName, guildId = null) {
        const key = guildId ? `${guildId}-${userId}-${commandName}` : `${userId}-${commandName}`;
        const userCooldown = this.cooldowns.get(key);
        
        if (!userCooldown) return 0;
        
        const now = Date.now();
        const limits = this.getLimits(commandName);
        const timeSinceLast = now - userCooldown.lastUsed;
        
        if (timeSinceLast >= limits.cooldown) return 0;
        
        return Math.ceil((limits.cooldown - timeSinceLast) / 1000);
    }
}

/**
 * Create a rate limit middleware for commands
 * @param {RateLimiter} rateLimiter - Rate limiter instance
 * @param {string} commandName - Command name
 * @returns {Function} - Middleware function
 */
function rateLimitMiddleware(rateLimiter, commandName) {
    return async function(context, next) {
        const userId = context.author?.id || context.user?.id;
        const guildId = context.guild?.id;
        
        if (!userId) return next();
        
        const result = rateLimiter.checkRateLimit(userId, commandName, guildId);
        
        if (result.limited) {
            const embed = new EmbedBuilder()
                .setTitle('⏱️ Rate Limited')
                .setDescription(result.message)
                .setColor('#ED4245')
                .setTimestamp();
            
            if (context.reply) {
                await context.reply({ embeds: [embed] });
            } else {
                await context.channel.send({ embeds: [embed] });
            }
            return;
        }
        
        await next();
    };
}

module.exports = {
    RateLimiter,
    rateLimitMiddleware
};
