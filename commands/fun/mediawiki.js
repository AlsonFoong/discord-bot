const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const wtf = require('wtf_wikipedia')
wtf.extend(require('wtf-plugin-api'))
const { splitText } = require('../../utilities/text.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('mediawiki')
        .setDescription('Commands related to MediaWiki.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addSubcommand(subcommand => subcommand
            .setName('random')
            .setDescription('Retrieve a random Wikipedia article.')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === 'random') {
            await interaction.deferReply()
                .catch(error => console.log(error))

            wtf.random().then((doc) => {
                const url = doc.url()
                const title = doc.title()
                const image = doc.images()[0]
                const text = doc.text()
                const arrayOfText = splitText(text, 4096)

                for (let index = 0; index < arrayOfText.length; index++) {
                    const textSnippet = arrayOfText[index];

                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name : '[REDACTED]',
                        iconURL: '[REDACTED]'
                    })
                    .setColor('#ff57f6')
                    .setTitle(`${title}`)
                    .setURL(`${url}`)
                    .setDescription(`${textSnippet}`)
                    .setFooter({ text: 'Powered by MediaWiki and wtf_wikipedia. Tables are not supported. Have a nice day!' })
                    
                    if (image) {
                        const thumbnail = image.url()
                        embed.setThumbnail(`${thumbnail}`)
                    }

                    setTimeout(() => {
                        interaction.followUp({ embeds: [embed] })
                    }, index * 1000) // Rate limits the followUps to every 1 second
                }
            })
        }
    }
    
}