/**
 * Bot metrics and statistics tracking
 */

const { logger } = require('../logger');
const os = require('os');

class MetricsCollector {
    constructor(client) {
        this.client = client;
        this.startTime = Date.now();
        this.metrics = {
            commands: {
                total: 0,
                byCommand: new Map(),
                byUser: new Map(),
                byGuild: new Map()
            },
            messages: {
                total: 0,
                byChannel: new Map(),
                byUser: new Map()
            },
            interactions: {
                total: 0,
                byCommand: new Map()
            },
            performance: {
                avgPing: [],
                maxPing: 0,
                minPing: Infinity
            },
            errors: {
                total: 0,
                byType: new Map()
            },
            uptime: {
                startTime: Date.now(),
                currentUptime: 0,
                totalDowntime: 0
            },
            system: {
                cpu: [],
                memory: [],
                timestamps: []
            }
        };
        
        this.metricsInterval = null;
        this.aggregateInterval = null;
        this.collectSystemMetrics = true;
    }

    start() {
        // Collect system metrics every 30 seconds
        if (this.collectSystemMetrics) {
            this.metricsInterval = setInterval(() => {
                this.collectSystemMetricsData();
            }, 30000);
        }
        
        // Aggregate and log metrics every 5 minutes
        this.aggregateInterval = setInterval(() => {
            this.aggregateMetrics();
        }, 300000);
        
        logger.info('📊 Metrics collection started');
    }

    collectSystemMetricsData() {
        const cpuUsage = os.loadavg()[0];
        const memoryUsage = (os.totalmem() - os.freemem()) / os.totalmem() * 100;
        
        this.metrics.system.cpu.push(cpuUsage);
        this.metrics.system.memory.push(memoryUsage);
        this.metrics.system.timestamps.push(Date.now());
        
        // Keep only last 100 data points
        if (this.metrics.system.cpu.length > 100) {
            this.metrics.system.cpu.shift();
            this.metrics.system.memory.shift();
            this.metrics.system.timestamps.shift();
        }
    }

    trackCommand(commandName, userId, guildId) {
        this.metrics.commands.total++;
        
        // By command
        const cmdCount = this.metrics.commands.byCommand.get(commandName) || 0;
        this.metrics.commands.byCommand.set(commandName, cmdCount + 1);
        
        // By user
        const userCount = this.metrics.commands.byUser.get(userId) || 0;
        this.metrics.commands.byUser.set(userId, userCount + 1);
        
        // By guild
        if (guildId) {
            const guildCount = this.metrics.commands.byGuild.get(guildId) || 0;
            this.metrics.commands.byGuild.set(guildId, guildCount + 1);
        }
    }

    trackMessage(userId, channelId) {
        this.metrics.messages.total++;
        
        const userCount = this.metrics.messages.byUser.get(userId) || 0;
        this.metrics.messages.byUser.set(userId, userCount + 1);
        
        const channelCount = this.metrics.messages.byChannel.get(channelId) || 0;
        this.metrics.messages.byChannel.set(channelId, channelCount + 1);
    }

    trackInteraction(commandName) {
        this.metrics.interactions.total++;
        
        const cmdCount = this.metrics.interactions.byCommand.get(commandName) || 0;
        this.metrics.interactions.byCommand.set(commandName, cmdCount + 1);
    }

    trackError(errorType) {
        this.metrics.errors.total++;
        
        const count = this.metrics.errors.byType.get(errorType) || 0;
        this.metrics.errors.byType.set(errorType, count + 1);
    }

    trackPing(ping) {
        this.metrics.performance.avgPing.push(ping);
        
        if (ping > this.metrics.performance.maxPing) {
            this.metrics.performance.maxPing = ping;
        }
        if (ping < this.metrics.performance.minPing) {
            this.metrics.performance.minPing = ping;
        }
        
        // Keep only last 100 pings
        if (this.metrics.performance.avgPing.length > 100) {
            this.metrics.performance.avgPing.shift();
        }
    }

    getAveragePing() {
        const pings = this.metrics.performance.avgPing;
        if (pings.length === 0) return 0;
        return pings.reduce((a, b) => a + b, 0) / pings.length;
    }

    getUptime() {
        return Date.now() - this.metrics.uptime.startTime;
    }

    getFormattedUptime() {
        const uptime = this.getUptime();
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((uptime / (1000 * 60)) % 60);
        const seconds = Math.floor((uptime / 1000) % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    aggregateMetrics() {
        const avgPing = this.getAveragePing();
        const uptime = this.getFormattedUptime();
        const totalCommands = this.metrics.commands.total;
        const totalMessages = this.metrics.messages.total;
        
        // Get top commands
        const topCommands = Array.from(this.metrics.commands.byCommand.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Get top users
        const topUsers = Array.from(this.metrics.commands.byUser.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Get system stats
        const avgCpu = this.metrics.system.cpu.length > 0 
            ? this.metrics.system.cpu.reduce((a, b) => a + b, 0) / this.metrics.system.cpu.length 
            : 0;
        const avgMemory = this.metrics.system.memory.length > 0 
            ? this.metrics.system.memory.reduce((a, b) => a + b, 0) / this.metrics.system.memory.length 
            : 0;
        
        // Log aggregated metrics
        logger.section('📊 Metrics Aggregation');
        logger.info(`Uptime: ${uptime}`);
        logger.info(`Total Commands: ${totalCommands.toLocaleString()}`);
        logger.info(`Total Messages: ${totalMessages.toLocaleString()}`);
        logger.info(`Average Ping: ${avgPing.toFixed(2)}ms`);
        logger.info(`Errors: ${this.metrics.errors.total}`);
        
        if (topCommands.length > 0) {
            logger.info('Top Commands:');
            topCommands.forEach(([cmd, count]) => {
                logger.info(`  ${cmd}: ${count} uses`);
            });
        }
        
        logger.info(`System - CPU: ${avgCpu.toFixed(2)}% | Memory: ${avgMemory.toFixed(2)}%`);
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: this.getFormattedUptime(),
            averagePing: this.getAveragePing(),
            topCommands: Array.from(this.metrics.commands.byCommand.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            system: {
                avgCpu: this.metrics.system.cpu.length > 0 
                    ? this.metrics.system.cpu.reduce((a, b) => a + b, 0) / this.metrics.system.cpu.length 
                    : 0,
                avgMemory: this.metrics.system.memory.length > 0 
                    ? this.metrics.system.memory.reduce((a, b) => a + b, 0) / this.metrics.system.memory.length 
                    : 0
            }
        };
    }

    stop() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
        if (this.aggregateInterval) {
            clearInterval(this.aggregateInterval);
            this.aggregateInterval = null;
        }
        logger.info('📊 Metrics collection stopped');
    }
}

module.exports = {
    MetricsCollector
};
