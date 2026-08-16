/**
 * Embed builder utility
 * Create consistent, beautiful embeds with ease
 */

const { EmbedBuilder } = require('discord.js');
const colors = require('./colors').colors;

/**
 * Create a standard embed
 * @param {object} options - Embed options
 * @returns {EmbedBuilder} - Embed object
 */
function createEmbed(options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || colors.primary)
        .setTimestamp(options.timestamp ? new Date() : null);
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.url) embed.setURL(options.url);
    if (options.author) {
        embed.setAuthor({
            name: options.author.name,
            iconURL: options.author.iconURL,
            url: options.author.url
        });
    }
    if (options.footer) {
        embed.setFooter({
            text: options.footer.text,
            iconURL: options.footer.iconURL
        });
    }
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.fields) {
        options.fields.forEach(field => {
            embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline || false
            });
        });
    }
    
    return embed;
}

/**
 * Create a success embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {object} options - Additional options
 * @returns {EmbedBuilder} - Success embed
 */
function successEmbed(title, description, options = {}) {
    return createEmbed({
        title: `✅ ${title}`,
        description: description,
        color: colors.success,
        ...options
    });
}

/**
 * Create an error embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {object} options - Additional options
 * @returns {EmbedBuilder} - Error embed
 */
function errorEmbed(title, description, options = {}) {
    return createEmbed({
        title: `❌ ${title}`,
        description: description,
        color: colors.danger,
        ...options
    });
}

/**
 * Create a warning embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {object} options - Additional options
 * @returns {EmbedBuilder} - Warning embed
 */
function warningEmbed(title, description, options = {}) {
    return createEmbed({
        title: `⚠️ ${title}`,
        description: description,
        color: colors.warning,
        ...options
    });
}

/**
 * Create an info embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {object} options - Additional options
 * @returns {EmbedBuilder} - Info embed
 */
function infoEmbed(title, description, options = {}) {
    return createEmbed({
        title: `ℹ️ ${title}`,
        description: description,
        color: colors.info,
        ...options
    });
}

/**
 * Create a loading embed
 * @param {string} title - Embed title
 * @param {string} description - Embed description
 * @param {object} options - Additional options
 * @returns {EmbedBuilder} - Loading embed
 */
function loadingEmbed(title = 'Loading...', description = 'Please wait...', options = {}) {
    return createEmbed({
        title: `⏳ ${title}`,
        description: description,
        color: colors.info,
        ...options
    });
}

/**
 * Create a paginated embed
 * @param {Array} items - Items to paginate
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @param {string} title - Embed title
 * @param {string} itemName - Name of each item
 * @param {Function} formatItem - Format function for each item
 * @param {object} options - Additional options
 * @returns {object} - { embed, totalPages, totalItems }
 */
function paginateEmbed(items, page = 1, perPage = 10, title = 'Items', itemName = 'Item', formatItem = null, options = {}) {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, totalItems);
    const pageItems = items.slice(start, end);
    
    const embed = createEmbed({
        title: `📋 ${title}`,
        description: options.description || `Showing ${itemName}s ${start + 1}-${end} of ${totalItems}`,
        color: options.color || colors.primary,
        fields: pageItems.map((item, index) => {
            const formatted = formatItem ? formatItem(item, start + index + 1) : item;
            return {
                name: `#${start + index + 1}`,
                value: formatted,
                inline: options.inlineFields !== undefined ? options.inlineFields : true
            };
        }),
        footer: {
            text: `Page ${page}/${totalPages} | Total ${itemName}s: ${totalItems}`,
            iconURL: options.footerIcon
        },
        ...options
    });
    
    return {
        embed,
        totalPages,
        totalItems,
        currentPage: page,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

/**
 * Create a field for an embed
 * @param {string} name - Field name
 * @param {string} value - Field value
 * @param {boolean} inline - Inline or not
 * @returns {object} - Field object
 */
function field(name, value, inline = true) {
    return { name, value, inline };
}

/**
 * Create a divider field
 * @param {string} text - Divider text
 * @returns {object} - Field object
 */
function divider(text = '━━━━━━━━━━━━━━━━━━━━━') {
    return { name: text, value: '\u200B', inline: false };
}

/**
 * Create a stats field with progress bar
 * @param {string} label - Label
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @param {string} color - Color (optional)
 * @returns {string} - Formatted stats with progress bar
 */
function progressBar(label, current, max, color = '⬛') {
    const percent = Math.min((current / max) * 100, 100);
    const filled = Math.floor(percent / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    return `${label}: ${current}/${max} (${percent.toFixed(1)}%)\n\`[${bar}]\``;
}

/**
 * Create a timestamp field
 * @param {number} timestamp - Unix timestamp
 * @param {string} format - Format (F, R, D, T, f)
 * @returns {string} - Formatted timestamp
 */
function timestamp(timestamp, format = 'F') {
    if (typeof timestamp === 'string') {
        timestamp = parseInt(timestamp);
    }
    return `<t:${Math.floor(timestamp / 1000)}:${format}>`;
}

/**
 * Create a relative time field
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Relative time
 */
function relativeTime(timestamp) {
    return timestamp(timestamp, 'R');
}

/**
 * Add fields in columns
 * @param {Array} fields - Array of field objects
 * @param {number} columns - Number of columns (1-3)
 * @returns {Array} - Array of field objects with inline set
 */
function columns(fields, columns = 2) {
    return fields.map((field, index) => ({
        ...field,
        inline: index % columns !== columns - 1
    }));
}

module.exports = {
    createEmbed,
    successEmbed,
    errorEmbed,
    warningEmbed,
    infoEmbed,
    loadingEmbed,
    paginateEmbed,
    field,
    divider,
    progressBar,
    timestamp,
    relativeTime,
    columns
};
