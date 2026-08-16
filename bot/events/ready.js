/**
 * Ready event handler
 * Runs when bot successfully connects
 */

const { logger } = require('../logger');
const constants = require('../constants');
const os = require('os');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // Log startup banner
        logger.banner();
        
        // Basic Info
        logger.section('Bot Information');
        logger.info(`Name: ${client.user.tag}`);
        logger.info(`ID: ${client.user.id}`);
        logger.info(`Status: 🟢 Online`);
        logger.info(`Prefix: ${process.env.PREFIX || '~-'}`);
        logger.info(`Commands: ${client.commands.size}`);
        logger.info(`Aliases: ${Object.keys(require('../utils/helpers').commandAliases).length}`);
        
        // Statistics
        logger.section('Statistics');
        logger.info(`Servers: ${client.guilds.cache.size}`);
        logger.info(`Users: ${client.users.cache.size.toLocaleString()}`);
        logger.info(`Channels: ${client.channels.cache.size}`);
        logger.info(`Ping: ${client.ws.ping}ms`);
        
        // System Info
        logger.section('System Information');
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
        const usedMemory = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
        const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
        const cpuUsage = os.loadavg()[0].toFixed(2);
        
        logger.info(`Platform: ${os.platform()} ${os.release()}`);
        logger.info(`Architecture: ${os.arch()}`);
        logger.info(`CPU Cores: ${os.cpus().length}`);
        logger.info(`CPU Usage: ${cpuUsage}%`);
        logger.info(`Memory: ${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB (${memoryUsage}%)`);
        logger.info(`Node.js: ${process.version}`);
        logger.info(`Discord.js: ${require('discord.js').version}`);
        
        // Server Details (first 5)
        if (client.guilds.cache.size > 0) {
            logger.section('Server Details');
            let count = 0;
            for (const guild of client.guilds.cache.values()) {
                if (count >= 5) {
                    logger.info(`... and ${client.guilds.cache.size - 5} more servers`);
                    break;
                }
                const owner = await guild.fetchOwner().catch(() => null);
                logger.info(`${guild.name} (${guild.id})`);
                logger.info(`  Members: ${guild.memberCount} | Owner: ${owner ? owner.user.tag : 'Unknown'}`);
                logger.info(`  Created: ${guild.createdAt.toLocaleDateString()}`);
                count++;
            }
        }
        
        // Command List
        logger.section('Command List');
        const commandList = require('../utils/helpers').getCommandList();
        for (const [name, data] of Object.entries(commandList)) {
            logger.info(`${data.main.padEnd(15)} → ${data.display}`);
        }
        
        // Final Status
        logger.section('Status');
        logger.success('Bot is ready and fully operational!');
        logger.info(`Started at: ${new Date().toLocaleString()}`);
        logger.divider('=', 60);
        logger.info('🚀 Bot is now online and ready to serve!');
        logger.divider('=', 60);
        
        // Set presence
        client.user.setPresence({
            activities: [
                {
                    name: `${client.guilds.cache.size} servers | ${process.env.PREFIX || '~-'}help`,
                    type: 3 // Watching
                }
            ],
            status: 'online'
        });
    }
};
