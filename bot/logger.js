/**
 * Advanced logging system with colors, levels, and file output
 */

const fs = require('fs');
const path = require('path');
const colors = require('./utils/colors').colors;

// Color codes for console
const consoleColors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m',
        crimson: '\x1b[38m'
    },
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        gray: '\x1b[100m',
        crimson: '\x1b[48m'
    }
};

// Log levels
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    SUCCESS: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
};

const LOG_LEVEL_NAMES = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'SUCCESS',
    3: 'WARN',
    4: 'ERROR',
    5: 'FATAL'
};

class Logger {
    constructor(options = {}) {
        this.level = options.level || LOG_LEVELS.INFO;
        this.logToFile = options.logToFile || true;
        this.logDir = options.logDir || './logs';
        this.maxLogFiles = options.maxLogFiles || 10;
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.consoleOutput = options.consoleOutput !== false;
        this.timestamps = options.timestamps !== false;
        
        // Create log directory if it doesn't exist
        if (this.logToFile && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        // Current log file
        this.currentLogFile = this.getLogFileName();
    }

    getLogFileName() {
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return path.join(this.logDir, `bot-${dateStr}.log`);
    }

    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${ms}`;
    }

    formatMessage(level, message, ...args) {
        const timestamp = this.timestamps ? `[${this.getTimestamp()}]` : '';
        const levelName = LOG_LEVEL_NAMES[level] || 'UNKNOWN';
        return `${timestamp} [${levelName}] ${message}`;
    }

    getColor(level) {
        switch (level) {
            case LOG_LEVELS.DEBUG: return consoleColors.fg.gray;
            case LOG_LEVELS.INFO: return consoleColors.fg.cyan;
            case LOG_LEVELS.SUCCESS: return consoleColors.fg.green;
            case LOG_LEVELS.WARN: return consoleColors.fg.yellow;
            case LOG_LEVELS.ERROR: return consoleColors.fg.red;
            case LOG_LEVELS.FATAL: return consoleColors.bg.red + consoleColors.fg.white;
            default: return consoleColors.fg.white;
        }
    }

    getEmoji(level) {
        switch (level) {
            case LOG_LEVELS.DEBUG: return '🔍';
            case LOG_LEVELS.INFO: return 'ℹ️';
            case LOG_LEVELS.SUCCESS: return '✅';
            case LOG_LEVELS.WARN: return '⚠️';
            case LOG_LEVELS.ERROR: return '❌';
            case LOG_LEVELS.FATAL: return '💀';
            default: return '📌';
        }
    }

    log(level, message, ...args) {
        if (level < this.level) return;

        const emoji = this.getEmoji(level);
        const timestamp = this.timestamps ? `[${this.getFormattedTime()}]` : '';
        const fullMessage = `${timestamp} ${emoji} ${message}`;

        // Console output with colors
        if (this.consoleOutput) {
            const color = this.getColor(level);
            const reset = consoleColors.reset;
            console.log(`${color}${fullMessage}${reset}`, ...args);
        }

        // File output
        if (this.logToFile) {
            this.writeToFile(level, message, ...args);
        }

        return this;
    }

    writeToFile(level, message, ...args) {
        try {
            const logMessage = this.formatMessage(level, message, ...args);
            const logLine = `${logMessage}\n`;
            
            // Check file size and rotate if needed
            this.checkAndRotateLog();
            
            fs.appendFileSync(this.currentLogFile, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    checkAndRotateLog() {
        try {
            if (!fs.existsSync(this.currentLogFile)) return;
            
            const stats = fs.statSync(this.currentLogFile);
            if (stats.size >= this.maxFileSize) {
                // Rename current log file
                const timestamp = Date.now();
                const newName = path.join(this.logDir, `bot-${timestamp}.log`);
                fs.renameSync(this.currentLogFile, newName);
                
                // Delete old log files if too many
                this.cleanupOldLogs();
                
                // Create new log file
                this.currentLogFile = this.getLogFileName();
            }
        } catch (error) {
            console.error('Failed to rotate log file:', error);
        }
    }

    cleanupOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir)
                .filter(f => f.startsWith('bot-') && f.endsWith('.log'))
                .map(f => ({
                    name: f,
                    path: path.join(this.logDir, f),
                    mtime: fs.statSync(path.join(this.logDir, f)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);

            if (files.length > this.maxLogFiles) {
                const toDelete = files.slice(this.maxLogFiles);
                toDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
        } catch (error) {
            console.error('Failed to cleanup old logs:', error);
        }
    }

    debug(message, ...args) {
        return this.log(LOG_LEVELS.DEBUG, message, ...args);
    }

    info(message, ...args) {
        return this.log(LOG_LEVELS.INFO, message, ...args);
    }

    success(message, ...args) {
        return this.log(LOG_LEVELS.SUCCESS, message, ...args);
    }

    warn(message, ...args) {
        return this.log(LOG_LEVELS.WARN, message, ...args);
    }

    error(message, ...args) {
        return this.log(LOG_LEVELS.ERROR, message, ...args);
    }

    fatal(message, ...args) {
        return this.log(LOG_LEVELS.FATAL, message, ...args);
    }

    // Create a header
    header(title, char = '=') {
        const line = char.repeat(60);
        this.info(`\n${line}`);
        this.info(`${char} ${title}`);
        this.info(`${line}\n`);
        return this;
    }

    // Create a section
    section(title) {
        this.info(`\n─── ${title} ───`);
        return this;
    }

    // Log with custom style
    custom(message, color = consoleColors.fg.white, emoji = '📌') {
        if (this.consoleOutput) {
            console.log(`${color}${emoji} ${message}${consoleColors.reset}`);
        }
        return this;
    }

    // Log a table
    table(data) {
        if (this.consoleOutput) {
            console.table(data);
        }
        return this;
    }

    // Log a divider
    divider(char = '─', length = 40) {
        this.info(char.repeat(length));
        return this;
    }

    // Log with progress
    progress(current, total, label = 'Progress') {
        const percent = Math.round((current / total) * 100);
        const filled = Math.round((percent / 100) * 20);
        const empty = 20 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        this.info(`${label}: [${bar}] ${percent}% (${current}/${total})`);
        return this;
    }

    // Log startup banner
    banner() {
        const banner = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██████╗  ██████╗ ████████╗                           ║
║   ██╔══██╗██╔═══██╗╚══██╔══╝                           ║
║   ██████╔╝██║   ██║   ██║                              ║
║   ██╔══██╗██║   ██║   ██║                              ║
║   ██████╔╝╚██████╔╝   ██║                              ║
║   ╚═════╝  ╚═════╝    ╚═╝                              ║
║                                                          ║
║   Advanced Discord Bot v2.0.0                           ║
║   Developed with ❤️  by Your Name                       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `;
        this.custom(banner, consoleColors.fg.cyan);
        return this;
    }
}

// Create singleton instance
const logger = new Logger({
    level: LOG_LEVELS.INFO,
    logToFile: true,
    consoleOutput: true,
    timestamps: true
});

module.exports = {
    Logger,
    logger,
    LOG_LEVELS,
    LOG_LEVEL_NAMES,
    consoleColors
};
