const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const helpEmbed = new EmbedBuilder()
    .setAuthor({
        name : '[REDACTED]',
        iconURL: '[REDACTED]'
    })
    .setColor('#ff57f6')
    .addFields(
        { name: 'Utility commands', value: '`/help`, `/ping`, `/user info`, `/user avatar`, `/role color view`, `/role color change`' },
        { name: 'Fun commands', value: '`/apod`, `/birthday`, `/gemini`, `/mediawiki`' }
    )
    .setFooter({ text: 'Have a nice day!' });

module.exports = {

    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Find helpful information regarding [REDACTED].')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),

    async execute(interaction) {

        helpEmbed
        .setTitle('Welcome to [REDACTED]!')
        .setDescription('[REDACTED] is a Discord bot created, managed, and maintained by [REDACTED]. As of now, [REDACTED] is a personal hobby project, and features will come along as deemed interesting.');

        interaction.reply({ embeds: [helpEmbed] });

    }

}