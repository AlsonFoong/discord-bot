const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const pingEmbed = new EmbedBuilder()
    .setAuthor({
        name : '[REDACTED]',
        iconURL: '[REDACTED]'
    })
    .setColor('#ff57f6')
    .setTitle('Ping')
    .setFooter({ text: 'Have a nice day!' });

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Determine the current status of the bot.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),
    async execute(interaction) {
        const sent = await interaction.reply({ embeds: [pingEmbed
            .setDescription('Calculating ping...')], fetchReply: true });
        interaction.editReply({ embeds: [pingEmbed
            .setDescription(`${sent.createdTimestamp - interaction.createdTimestamp} ms`)
        ]});
    },
    
};