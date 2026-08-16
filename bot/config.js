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
    }
};
