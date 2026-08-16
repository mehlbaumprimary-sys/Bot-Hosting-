const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const config = require('../config');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays detailed bot statistics'),
    
    async execute(message, args) {
        const embed = await createStatsEmbed(message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = await createStatsEmbed(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createStatsEmbed(client) {
    // Memory Stats
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024 / 1024;
    const usedMemory = totalMemory - freeMemory;
    const memoryPercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    // Process Memory
    const processMemory = process.memoryUsage();
    const heapUsed = (processMemory.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (processMemory.heapTotal / 1024 / 1024).toFixed(2);
    const rss = (processMemory.rss / 1024 / 1024).toFixed(2);
    
    // CPU Stats
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const cpus = os.cpus().length;
    
    // Bot Stats
    const commands = client.commands.size;
    const servers = client.guilds.cache.size;
    const users = client.users.cache.size;
    const channels = client.channels.cache.size;
    const uptime = client.uptime;
    const uptimeStr = formatUptime(uptime);
    const ping = client.ws.ping;
    
    // Server Details
    let totalMembers = 0;
    let totalChannels = 0;
    let totalRoles = 0;
    let totalEmojis = 0;
    let totalBoostLevel = 0;
    let totalBoosts = 0;
    let largestServer = { name: 'None', members: 0 };
    
    for (const guild of client.guilds.cache.values()) {
        await guild.fetch();
        totalMembers += guild.memberCount;
        totalChannels += guild.channels.cache.size;
        totalRoles += guild.roles.cache.size - 1;
        totalEmojis += guild.emojis.cache.size;
        totalBoostLevel += guild.premiumTier || 0;
        totalBoosts += guild.premiumSubscriptionCount || 0;
        
        if (guild.memberCount > largestServer.members) {
            largestServer = { name: guild.name, members: guild.memberCount };
        }
    }
    
    const avgMembers = servers > 0 ? Math.round(totalMembers / servers) : 0;
    
    const embed = new EmbedBuilder()
        .setTitle('📊 Bot Statistics')
        .setColor(config.colors.primary)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            // Bot Statistics
            { name: '🤖 Bot Statistics', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Total Servers', value: `${servers}`, inline: true },
            { name: 'Total Users', value: `${users.toLocaleString()}`, inline: true },
            { name: 'Total Channels', value: `${channels}`, inline: true },
            { name: 'Commands Loaded', value: `${commands}`, inline: true },
            { name: 'Uptime', value: uptimeStr, inline: true },
            { name: 'Ping', value: `${ping}ms`, inline: true },
            
            // Server Statistics
            { name: '🏠 Server Statistics', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Total Members', value: `${totalMembers.toLocaleString()}`, inline: true },
            { name: 'Average Members/Server', value: `${avgMembers}`, inline: true },
            { name: 'Largest Server', value: `${largestServer.name} (${largestServer.members} members)`, inline: true },
            { name: 'Total Roles', value: `${totalRoles}`, inline: true },
            { name: 'Total Emojis', value: `${totalEmojis}`, inline: true },
            { name: 'Total Boosts', value: `${totalBoosts} (Level ${totalBoostLevel})`, inline: true },
            
            // System Statistics
            { name: '💻 System Statistics', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'CPU Cores', value: `${cpus}`, inline: true },
            { name: 'CPU Load', value: `${cpuLoad}%`, inline: true },
            { name: 'Memory Usage', value: `${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB (${memoryPercent}%)`, inline: true },
            { name: 'Heap Usage', value: `${heapUsed}MB / ${heapTotal}MB`, inline: true },
            { name: 'RSS Memory', value: `${rss}MB`, inline: true },
            { name: 'Node.js', value: process.version, inline: true },
            
            // Activity
            { name: '📈 Activity', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Messages (Last Hour)', value: 'N/A', inline: true },
            { name: 'Commands Used', value: 'N/A', inline: true },
            { name: 'Status', value: '🟢 Online', inline: true }
        )
        .setFooter({ text: `Stats updated at` })
        .setTimestamp();

    return embed;
}

function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
