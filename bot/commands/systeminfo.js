const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const config = require('../config');
const os = require('os');
const process = require('process');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('systeminfo')
        .setDescription('Displays detailed system information'),
    
    async execute(message, args) {
        const embed = await createSystemInfoEmbed(message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = await createSystemInfoEmbed(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createSystemInfoEmbed(client) {
    // System Info
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    const hostname = os.hostname();
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const cpuModel = cpus[0]?.model || 'Unknown';
    const cpuSpeed = cpus[0]?.speed || 0;
    
    // Memory Info
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024 / 1024;
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);
    
    // CPU Load
    const loadAvg = os.loadavg();
    const cpuLoad1min = loadAvg[0].toFixed(2);
    const cpuLoad5min = loadAvg[1].toFixed(2);
    const cpuLoad15min = loadAvg[2].toFixed(2);
    
    // Uptime
    const systemUptime = os.uptime();
    const systemDays = Math.floor(systemUptime / 86400);
    const systemHours = Math.floor((systemUptime % 86400) / 3600);
    const systemMinutes = Math.floor((systemUptime % 3600) / 60);
    const systemSeconds = Math.floor(systemUptime % 60);
    const systemUptimeStr = `${systemDays}d ${systemHours}h ${systemMinutes}m ${systemSeconds}s`;
    
    // Network Info
    const networkInterfaces = os.networkInterfaces();
    let ipAddresses = [];
    for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddresses.push(`${name}: ${iface.address}`);
            }
        }
    }
    const ipList = ipAddresses.length > 0 ? ipAddresses.join('\n') : 'None';
    
    // Process Info
    const processMemory = process.memoryUsage();
    const processMemoryUsed = (processMemory.heapUsed / 1024 / 1024).toFixed(2);
    const processMemoryTotal = (processMemory.heapTotal / 1024 / 1024).toFixed(2);
    const processMemoryRSS = (processMemory.rss / 1024 / 1024).toFixed(2);
    
    const embed = new EmbedBuilder()
        .setTitle('🖥️ System Information')
        .setColor(config.colors.info)
        .setThumbnail('https://cdn.discordapp.com/attachments/1234567890/1234567890/system.png')
        .addFields(
            // System Info
            { name: '📱 System Overview', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Operating System', value: `${platform} ${release}`, inline: true },
            { name: 'Hostname', value: hostname, inline: true },
            { name: 'Architecture', value: arch, inline: true },
            
            // CPU Info
            { name: '⚡ CPU Information', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'CPU Model', value: cpuModel, inline: true },
            { name: 'CPU Cores', value: `${cpuCount}`, inline: true },
            { name: 'CPU Speed', value: `${cpuSpeed}MHz`, inline: true },
            { name: 'Load (1m)', value: `${cpuLoad1min}%`, inline: true },
            { name: 'Load (5m)', value: `${cpuLoad5min}%`, inline: true },
            { name: 'Load (15m)', value: `${cpuLoad15min}%`, inline: true },
            
            // Memory Info
            { name: '💾 Memory Information', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Total RAM', value: `${totalMemory.toFixed(2)} GB`, inline: true },
            { name: 'Used RAM', value: `${usedMemory.toFixed(2)} GB`, inline: true },
            { name: 'Free RAM', value: `${freeMemory.toFixed(2)} GB`, inline: true },
            { name: 'Memory Usage', value: `${memoryUsagePercent}%`, inline: true },
            { name: 'Process Heap', value: `${processMemoryUsed} MB / ${processMemoryTotal} MB`, inline: true },
            { name: 'Process RSS', value: `${processMemoryRSS} MB`, inline: true },
            
            // Network Info
            { name: '🌐 Network Information', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'IP Addresses', value: ipList.length > 100 ? ipList.slice(0, 100) + '...' : ipList, inline: false },
            
            // Uptime
            { name: '⏱️ System Uptime', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'System Uptime', value: systemUptimeStr, inline: true },
            { name: 'Bot Uptime', value: formatUptime(client.uptime), inline: true },
            
            // Additional Info
            { name: '📊 Additional Info', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Node.js Version', value: process.version, inline: true },
            { name: 'Discord.js Version', value: version, inline: true },
            { name: 'Platform', value: `${os.type()} ${os.release()}`, inline: true }
        )
        .setFooter({ text: `Requested by ${client.user.tag}` })
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
