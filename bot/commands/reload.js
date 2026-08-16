const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a specific command')
        .addStringOption(option => 
            option.setName('command')
                .setDescription('The command to reload')
                .setRequired(true)),
    
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please specify a command to reload!');
        }
        
        const commandName = args[0].toLowerCase();
        await reloadCommand(message, commandName);
    },

    async executeSlash(interaction) {
        const commandName = interaction.options.getString('command').toLowerCase();
        await reloadCommand(interaction, commandName);
    }
};

async function reloadCommand(context, commandName) {
    const commandPath = path.join(__dirname, `${commandName}.js`);
    
    if (!fs.existsSync(commandPath)) {
        const errorMsg = `❌ Command "${commandName}" not found!`;
        if (context.reply) {
            await context.reply(errorMsg);
        } else {
            await context.reply({ content: errorMsg, ephemeral: true });
        }
        return;
    }
    
    try {
        // Clear require cache
        delete require.cache[require.resolve(commandPath)];
        
        const newCommand = require(commandPath);
        context.client.commands.set(commandName, newCommand);
        
        const successMsg = `✅ Command "${commandName}" reloaded successfully!`;
        console.log(`[RELOAD] ${commandName} reloaded at ${new Date().toLocaleString()}`);
        
        const embed = new EmbedBuilder()
            .setTitle('Command Reloaded')
            .setColor('#57F287')
            .addFields(
                { name: 'Command', value: commandName, inline: true },
                { name: 'Status', value: '✅ Success', inline: true },
                { name: 'Time', value: new Date().toLocaleString(), inline: true }
            )
            .setTimestamp();
        
        if (context.reply) {
            await context.reply({ embeds: [embed] });
        } else {
            await context.reply({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error(`[RELOAD ERROR] ${error}`);
        const errorMsg = `❌ Failed to reload "${commandName}": ${error.message}`;
        
        if (context.reply) {
            await context.reply(errorMsg);
        } else {
            await context.reply({ content: errorMsg, ephemeral: true });
        }
    }
}
