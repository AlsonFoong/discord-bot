const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { NASA_API_KEY } = require('../../config.json')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('apod')
        .setDescription('Fetch the latest Astronomy Picture of the Day (APOD).')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(string => string
            .setName('date')
            .setDescription('Fetch an APOD from a specific date (YYYY-MM-DD). The earliest APOD is dated 1995-06-16.')
        ),

    async execute(interaction) {

        await interaction.deferReply()

        let fetchURL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        const specifiedDate = interaction.options.getString('date');
        if (specifiedDate) {
            fetchURL += `&date=${specifiedDate}`
        }

        fetch(fetchURL)
            .then(response => {
                if (response.status === 404) {
                    throw new Error('No data available.')
                } else if (!response.ok) {
                    throw new Error('Invalid response.')
                };
                return response.json();
            })
            .then(data => {

                const title = data.title;
                const explanation = data.explanation;
                const copyright = data.copyright ??= 'None';
                const date = data.date;
                const url = data.url;
                const mediaType = data.media_type;

                if (mediaType === 'image') {

                    const apodEmbed = new EmbedBuilder()
                    .setAuthor({
                        name : '[REDACTED]',
                        iconURL: '[REDACTED]'
                    })
                    .setColor('#ff57f6')
                    .setFooter({ text: 'Data courtesy of the NASA API. Have a nice day!' })
                    .setTitle(title)
                    .setDescription(`${explanation}`)
                    .addFields(
                        { name: 'Copyright', value: `${copyright}`, inline: true },
                        { name: 'Date', value: `${date}`, inline: true },
                    )
                    .setImage(url);

                    interaction.followUp({ embeds: [apodEmbed] });

                } else if (mediaType === 'video') {
                    
                    // Embeds do not support the display of videos
                    interaction.followUp({ content: `**[${title}](${url})**:\n\n${explanation}\n\nCopyright: ${copyright}\nDate: ${date}` });

                } else {
                    interaction.followUp({ content: 'Sorry, the media format of this APOD is not supported. Please contact [REDACTED].' });
                }
            })
            .catch(error => {
                if (error.message === 'No data available.') {
                    interaction.followUp({ content: 'Sorry, there was no APOD on this day.' });
                } else {
                    console.error(error)
                    interaction.followUp({ content: 'Sorry, the API did not return a valid response. Try again!\n\nIf you are passing in a date argument, make sure it is formatted as YYYY-MM-DD, for example, `1995-06-16`, which is when the first APOD was posted.', ephemeral: true });
                }
            });

    },

};
