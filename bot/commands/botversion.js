const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const config = require('../config');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botversion')
        .setDescription('Displays bot version information'),
    
    async execute(message, args) {
        const embed = await createBotVersionEmbed(message.client);
        await message.reply({ embeds: [embed] });
    },

    async executeSlash(interaction) {
        const embed = await createBotVersionEmbed(interaction.client);
        await interaction.reply({ embeds: [embed] });
    }
};

async function createBotVersionEmbed(client) {
    // Read package.json
    let packageJson = {};
    try {
        const packagePath = path.join(__dirname, '..', 'package.json');
        packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch (error) {
        console.error('Failed to read package.json:', error);
    }
    
    // Git info (if available)
    let gitBranch = 'Unknown';
    let gitCommit = 'Unknown';
    try {
        const gitHeadPath = path.join(__dirname, '..', '.git', 'HEAD');
        if (fs.existsSync(gitHeadPath)) {
            const headContent = fs.readFileSync(gitHeadPath, 'utf8');
            const refMatch = headContent.match(/ref: refs\/heads\/(.+)/);
            if (refMatch) {
                gitBranch = refMatch[1];
                const refPath = path.join(__dirname, '..', '.git', 'refs', 'heads', gitBranch);
                if (fs.existsSync(refPath)) {
                    gitCommit = fs.readFileSync(refPath, 'utf8').trim().slice(0, 7);
                }
            }
        }
    } catch (error) {
        // Git info not available
    }
    
    const botUptime = client.uptime;
    const uptimeStr = formatUptime(botUptime);
    
    const embed = new EmbedBuilder()
        .setTitle('🤖 Bot Version Information')
        .setColor(config.colors.primary)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            // Basic Info
            { name: '📝 Basic Information', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Bot Name', value: client.user.tag, inline: true },
            { name: 'Bot ID', value: client.user.id, inline: true },
            { name: 'Status', value: '🟢 Online', inline: true },
            
            // Version Info
            { name: '📦 Version Information', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Bot Version', value: packageJson.version || '1.0.0', inline: true },
            { name: 'Node.js Version', value: process.version, inline: true },
            { name: 'Discord.js Version', value: version, inline: true },
            { name: 'NPM Version', value: packageJson.dependencies ? Object.keys(packageJson.dependencies).map(d => `${d}@${packageJson.dependencies[d]}`).join('\n') : 'Unknown', inline: false },
            
            // Git Info
            { name: '🔧 Development Info', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Git Branch', value: gitBranch, inline: true },
            { name: 'Git Commit', value: gitCommit, inline: true },
            { name: 'Environment', value: process.env.NODE_ENV || 'development', inline: true },
            
            // Stats
            { name: '📊 Bot Statistics', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Commands', value: `${client.commands.size}`, inline: true },
            { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Channels', value: `${client.channels.cache.size}`, inline: true },
            { name: 'Uptime', value: uptimeStr, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            
            // More Info
            { name: '📅 Additional Info', value: '━━━━━━━━━━━━━━━━━━━', inline: false },
            { name: 'Started At', value: `<t:${Math.floor((Date.now() - botUptime) / 1000)}:F>`, inline: true },
            { name: 'Platform', value: process.platform, inline: true },
            { name: 'Architecture', value: process.arch, inline: true }
        )
        .setFooter({ text: `Bot Version ${packageJson.version || '1.0.0'}` })
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
