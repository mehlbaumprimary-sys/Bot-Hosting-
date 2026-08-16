/**
 * Color management utility
 * Centralized color palette for the bot
 */

const colors = {
    // Main Colors
    primary: '#5865F2',      // Discord Blue
    success: '#57F287',      // Green
    warning: '#FEE75C',      // Yellow
    danger: '#ED4245',       // Red
    info: '#5865F2',         // Blue
    
    // Extended Colors
    blurple: '#5865F2',
    green: '#57F287',
    yellow: '#FEE75C',
    red: '#ED4245',
    fuchsia: '#EB459E',
    white: '#FFFFFF',
    black: '#000000',
    
    // Gradients (for embeds)
    gradients: {
        rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'],
        sunset: ['#FF512F', '#F09819'],
        ocean: ['#2E3192', '#1BFFFF'],
        fire: ['#F12711', '#F5AF19'],
        ice: ['#00C9FF', '#92FE9D']
    },
    
    // Role Colors (by hex)
    roles: {
        admin: '#FF0000',
        moderator: '#FF7F00',
        developer: '#00FF00',
        vip: '#FFD700',
        booster: '#F47FFF',
        default: '#5865F2'
    },
    
    // Status Colors
    status: {
        online: '#57F287',
        idle: '#FEE75C',
        dnd: '#ED4245',
        offline: '#80848E',
        streaming: '#593695'
    }
};

/**
 * Get a random color from an array
 * @param {Array} colorArray - Array of colors
 * @returns {string} - Random hex color
 */
function getRandomColor(colorArray = Object.values(colors)) {
    return colorArray[Math.floor(Math.random() * colorArray.length)];
}

/**
 * Get a gradient color based on percentage
 * @param {Array} gradient - Array of colors
 * @param {number} percentage - 0-100
 * @returns {string} - Color at percentage
 */
function getGradientColor(gradient, percentage) {
    if (!gradient || gradient.length < 2) return colors.primary;
    const index = Math.floor((percentage / 100) * (gradient.length - 1));
    return gradient[index];
}

/**
 * Lighten a hex color
 * @param {string} hex - Hex color
 * @param {number} amount - 0-100
 * @returns {string} - Lightened hex
 */
function lightenColor(hex, amount = 20) {
    let color = hex.replace('#', '');
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }
    const num = parseInt(color, 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color
 * @param {string} hex - Hex color
 * @param {number} amount - 0-100
 * @returns {string} - Darkened hex
 */
function darkenColor(hex, amount = 20) {
    let color = hex.replace('#', '');
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }
    const num = parseInt(color, 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Check if a color is dark
 * @param {string} hex - Hex color
 * @returns {boolean} - True if dark
 */
function isDarkColor(hex) {
    const color = hex.replace('#', '');
    const num = parseInt(color, 16);
    const r = (num >> 16) & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = num & 0xFF;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}

module.exports = {
    colors,
    getRandomColor,
    getGradientColor,
    lightenColor,
    darkenColor,
    isDarkColor
};
