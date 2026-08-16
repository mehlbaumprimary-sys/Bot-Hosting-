require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    prefix: process.env.PREFIX || '~-',
    colors: {
        primary: '#5865F2',
        success: '#57F287',
        warning: '#FEE75C',
        danger: '#ED4245',
        info: '#5865F2'
    },
    emojis: {
        online: '🟢',
        idle: '🟡',
        dnd: '🔴',
        offline: '⚫'
    },
    // RPC Configuration
    rpc: {
        enabled: true,
        clientId: process.env.CLIENT_ID, // Same as bot client ID
        largeImageKey: 'bot_icon', // You need to upload this to Discord Developer Portal
        largeImageText: 'Discord Bot',
        smallImageKey: 'online',
        smallImageText: 'Online',
        details: 'Managing servers',
        state: 'Ready to help!',
        buttonLabel: 'Invite Me',
        buttonUrl: 'https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot'
    }
};
