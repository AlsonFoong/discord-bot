const { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js')

const fanartChannelId = '[REDACTED]'

module.exports = {

    data: new ContextMenuCommandBuilder()
        .setName('Post to #fanart (Creation)')
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        if (interaction.user.id !== '[REDACTED]') {
            interaction.followUp({ content: `You don't have permission to do this.` })
            return;
        }

        const message = interaction.targetMessage
        const timestamp = (message.createdTimestamp).toString().slice(0, -3)
        const messageUrl = message.url
        const attachments = message.attachments
        const user = message.author
        const fanartChannel = await interaction.client.channels.fetch(fanartChannelId)

        await fanartChannel.send({
            content: `Created by ${user.displayName}, received on <t:${timestamp}:f>.\n${messageUrl}`,
            files: Array.from(attachments.values())
        })
        .then(message => {
            message.edit({ content: `Created by <@${user.id}>, received on <t:${timestamp}:f>.\n${messageUrl}` })
        })

        interaction.followUp({ content: 'The message has been posted to the fanart channel!' })
    }
}