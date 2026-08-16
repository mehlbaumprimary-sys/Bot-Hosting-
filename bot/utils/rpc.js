const DiscordRPC = require('discord-rpc');
const config = require('../config');

class RPCManager {
    constructor(client) {
        this.client = client;
        this.rpc = null;
        this.startTime = Date.now();
        this.enabled = config.rpc.enabled;
        this.activityInterval = null;
    }

    async initialize() {
        if (!this.enabled) {
            console.log('⚠️ RPC is disabled in config');
            return;
        }

        try {
            // Initialize RPC
            DiscordRPC.register(config.rpc.clientId);
            this.rpc = new DiscordRPC.Client({ transport: 'ipc' });

            // Login to RPC
            await this.rpc.login({ clientId: config.rpc.clientId });
            console.log('✅ RPC (Rich Presence) initialized successfully!');

            // Set initial activity
            await this.updateActivity();

            // Update activity every 15 seconds
            this.activityInterval = setInterval(() => {
                this.updateActivity();
            }, 15000);

            // Handle RPC events
            this.rpc.on('ready', () => {
                console.log('🔄 RPC is ready and connected!');
            });

            this.rpc.on('disconnected', () => {
                console.log('⚠️ RPC disconnected, attempting to reconnect...');
                this.reconnect();
            });

        } catch (error) {
            console.error('❌ Failed to initialize RPC:', error.message);
            console.log('⚠️ RPC will continue running without Rich Presence');
        }
    }

    async updateActivity() {
        if (!this.rpc || !this.enabled) return;

        try {
            const guilds = this.client.guilds.cache.size;
            const users = this.client.users.cache.size;
            const commands = this.client.commands.size;
            const uptime = this.client.uptime;
            const ping = this.client.ws.ping;

            // Calculate uptime
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((uptime / (1000 * 60)) % 60);
            const uptimeStr = `${days}d ${hours}h ${minutes}m`;

            // Get random status messages
            const statusMessages = [
                `📊 ${guilds} servers`,
                `👥 ${users.toLocaleString()} users`,
                `⚡ ${ping}ms ping`,
                `⏱️ ${uptimeStr}`,
                `📋 ${commands} commands`,
                `🎮 ${config.prefix}help`,
                '✨ Online & Ready!',
                '🚀 Always improving...',
                '💻 Made with ❤️'
            ];

            // Rotate through different activities
            const activityIndex = Math.floor((Date.now() / 30000) % statusMessages.length);
            const currentActivity = statusMessages[activityIndex];

            // Set the activity
            this.rpc.setActivity({
                details: config.rpc.details || 'Managing servers',
                state: config.rpc.state || 'Ready to help!',
                startTimestamp: this.startTime,
                largeImageKey: config.rpc.largeImageKey || 'bot_icon',
                largeImageText: config.rpc.largeImageText || 'Discord Bot',
                smallImageKey: config.rpc.smallImageKey || 'online',
                smallImageText: config.rpc.smallImageText || 'Online',
                buttons: config.rpc.buttonLabel ? [
                    {
                        label: config.rpc.buttonLabel,
                        url: config.rpc.buttonUrl || 'https://discord.com'
                    }
                ] : undefined,
                instance: false,
            });

            console.log(`🔄 RPC Updated: ${currentActivity}`);

        } catch (error) {
            console.error('❌ Failed to update RPC activity:', error);
        }
    }

    async reconnect() {
        if (!this.enabled) return;

        try {
            await this.rpc.destroy();
            await this.initialize();
        } catch (error) {
            console.error('❌ Failed to reconnect RPC:', error);
            // Retry after 30 seconds
            setTimeout(() => this.reconnect(), 30000);
        }
    }

    destroy() {
        if (this.activityInterval) {
            clearInterval(this.activityInterval);
        }
        if (this.rpc) {
            this.rpc.destroy();
            console.log('✅ RPC destroyed');
        }
    }
}

module.exports = RPCManager;
