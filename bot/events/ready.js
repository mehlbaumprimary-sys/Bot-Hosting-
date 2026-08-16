/**
 * 🚀 Ready Event Handler
 * Runs when bot successfully connects to Discord
 * EVERYTHING WITH EMOJIS! 🎉
 */

const { logger } = require('../logger');
const os = require('os');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('\n' + '='.repeat(70));
        console.log('🎮'.repeat(20));
        console.log('='.repeat(70));
        
        // 🎯 BOT INFORMATION
        console.log('\n📝 **BOT INFORMATION**');
        console.log('─'.repeat(70));
        console.log(`  🤖 Bot Name:     ${client.user.tag}`);
        console.log(`  🆔 Bot ID:       ${client.user.id}`);
        console.log(`  🟢 Status:       Online`);
        console.log(`  ⚡ Prefix:       ${process.env.PREFIX || '~-'}`);
        console.log(`  📋 Commands:     ${client.commands.size}`);
        console.log(`  🔗 Aliases:      ${Object.keys(require('../utils/helpers').commandAliases).length}`);
        
        // 📊 STATISTICS
        console.log('\n📊 **BOT STATISTICS**');
        console.log('─'.repeat(70));
        console.log(`  🏠 Servers:      ${client.guilds.cache.size}`);
        console.log(`  👥 Users:        ${client.users.cache.size.toLocaleString()}`);
        console.log(`  📺 Channels:     ${client.channels.cache.size}`);
        console.log(`  ⏱️  Ping:         ${client.ws.ping}ms`);
        
        // 💻 SYSTEM INFORMATION
        console.log('\n💻 **SYSTEM INFORMATION**');
        console.log('─'.repeat(70));
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
        const usedMemory = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
        const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
        const cpuUsage = os.loadavg()[0].toFixed(2);
        
        console.log(`  🖥️  Platform:    ${os.platform()} ${os.release()}`);
        console.log(`  🔧 Arch:        ${os.arch()}`);
        console.log(`  🧠 CPU Cores:   ${os.cpus().length}`);
        console.log(`  🌡️  CPU Usage:   ${cpuUsage}%`);
        console.log(`  💾 Memory:      ${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB (${memoryUsage}%)`);
        console.log(`  📦 Node.js:     ${process.version}`);
        console.log(`  📦 Discord.js:  ${require('discord.js').version}`);
        
        // 🏠 SERVER DETAILS (First 5)
        if (client.guilds.cache.size > 0) {
            console.log('\n🏠 **SERVER DETAILS**');
            console.log('─'.repeat(70));
            let count = 0;
            for (const guild of client.guilds.cache.values()) {
                if (count >= 5) {
                    console.log(`  ... and ${client.guilds.cache.size - 5} more servers 🌟`);
                    break;
                }
                const owner = await guild.fetchOwner().catch(() => null);
                console.log(`  📌 ${guild.name}`);
                console.log(`     🆔 ID: ${guild.id}`);
                console.log(`     👥 Members: ${guild.memberCount}`);
                console.log(`     👑 Owner: ${owner ? owner.user.tag : 'Unknown'}`);
                console.log(`     📅 Created: ${guild.createdAt.toLocaleDateString()}`);
                console.log(`     🎨 Roles: ${guild.roles.cache.size - 1}`);
                console.log(`     😀 Emojis: ${guild.emojis.cache.size}`);
                console.log(`     ⚡ Boost: Level ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`);
                count++;
            }
        }
        
        // 📋 COMMAND LIST
        console.log('\n📋 **COMMAND LIST**');
        console.log('─'.repeat(70));
        const commandList = require('../utils/helpers').getCommandList();
        for (const [name, data] of Object.entries(commandList)) {
            console.log(`  ${name.padEnd(15)} → ${data.display}`);
        }
        
        // 🎮 RPC STATUS
        console.log('\n🎮 **RICH PRESENCE (RPC)**');
        console.log('─'.repeat(70));
        console.log(`  ✅ RPC Initialized successfully!`);
        console.log(`  🔄 Status: ${client.guilds.cache.size} servers | ${process.env.PREFIX || '~-'}help`);
        
        // ⏱️ UPTIME
        console.log('\n⏱️ **UPTIME DETAILS**');
        console.log('─'.repeat(70));
        console.log(`  🚀 Started at: ${new Date().toLocaleString()}`);
        console.log(`  ⚡ Ping: ${client.ws.ping}ms`);
        
        // ✅ FINAL STATUS
        console.log('\n' + '='.repeat(70));
        console.log('✅ **BOT IS READY AND FULLY OPERATIONAL!** 🎉');
        console.log('='.repeat(70));
        console.log('🎮'.repeat(20));
        console.log('='.repeat(70) + '\n');
        
        // Set presence with emojis
        client.user.setPresence({
            activities: [
                {
                    name: `🎮 ${client.guilds.cache.size} servers | ${process.env.PREFIX || '~-'}help`,
                    type: 3 // Watching
                }
            ],
            status: 'online'
        });
        
        // Log to file with emojis
        logger.success(`🤖 Bot ${client.user.tag} is now online!`);
        logger.info(`🏠 Connected to ${client.guilds.cache.size} servers`);
        logger.info(`👥 Serving ${client.users.cache.size.toLocaleString()} users`);
        logger.info(`⚡ Ping: ${client.ws.ping}ms`);
        logger.info(`📋 ${client.commands.size} commands loaded`);
        logger.success(`🎮 RPC initialized!`);
    }
};
