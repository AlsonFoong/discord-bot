const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Jimp = require('jimp');

const embed = new EmbedBuilder()
    .setAuthor({
        name : '[REDACTED]',
        iconURL: '[REDACTED]'
    })
    .setColor('#ff57f6')
    .setFooter({ text: 'Have a nice day!' });

const personalQuotes = [
    '[REDACTED]'
]

module.exports = {

    data: new SlashCommandBuilder()
        .setName('insight')
        .setDescription('Get an insightful quote.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2),

    async execute(interaction) {

        fetch(`https://api.fisenko.net/v1/quotes/en/random`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid response.');
                };
                return response.json();
            })
            .then(data => {
                
                const imageWidth = 700;
                const imageHeight = 1000;
                const textBufferX = 20;
                const textBufferY = 12;
                const extraBottomBuffer = 2;
                let finalHeight = textBufferY + extraBottomBuffer;

                new Jimp(imageWidth, imageHeight, '#FFFFFF', (error, image) => {

                    if (error) throw error;
                    // Converted TTF to FNT using: https://ttf2fnt.com/
                    Jimp.loadFont('Related/Fonts/LexendDeca-Regular.fnt').then(font => {

                        image.print( // Deals with the main body of text
                            font,
                            textBufferX,
                            textBufferY,
                            `${data.text}`,
                            imageWidth - (textBufferX * 2),
                            imageHeight - (textBufferY * 2),

                            (error, image, {x, y}) => {
                                if (error) throw error;

                                image.print( // Deals with the display of the author's name
                                    font,
                                    -textBufferX,
                                    y + 10,
                                    { text: `- ${data.author.name}`, alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT },
                                    imageWidth,
                                    imageHeight,

                                    (error, image, {x, y}) => {
                                        if (error) throw error;
                                        finalHeight += y
                                    }
                                )
                            }
                        )

                        image.crop(0, 0, imageWidth, finalHeight);
                        image.getBuffer(Jimp.MIME_PNG, (error, imageFile) => {
                            if (error) throw error;

                            const quotesImage = new AttachmentBuilder()
                            .setFile(imageFile)
                            .setName('image.png');
                            const replyEmbed = embed
                            .setDescription('Dictums are submitted by the public, so expect variation in response quality and standard, and exercise substantiation.')
                            .setImage('attachment://image.png')
                            .setFooter({ text: 'Data courtesy of the Dictum API. Have a nice day!' });
                            interaction.reply({ embeds: [replyEmbed], files: [quotesImage] });
                        });

                    });

                });

            })
            .catch(error => {
                console.error(error)
                interaction.reply({ content: 'Sorry, the API could not be reached. Try again!', ephemeral: true })
            })

    },

};