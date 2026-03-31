const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GIPHY_API_KEY } = require('../../config.json');

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}


module.exports = {

    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Wish someone a happy birthday! Powered by GIPHY.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addUserOption(user => user
            .setName('user')
            .setDescription('The lucky birthday person!')
            .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply()

        const executingUser = interaction.user;
        const targetUser = interaction.options.getUser('user');
        const numberOfGifs = 25;

        fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=birthday&limit=${numberOfGifs}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid response.')
                };
                return response.json();
            })
            .then(data => {

                const randomGif = data.data[getRandomIntInclusive(0, numberOfGifs - 1)];
                const url = randomGif.url;

                if (executingUser.id === targetUser.id) {
                    interaction.followUp({ content: `${executingUser} is wishing themselves a [happy birthday](${url} )!` });
                } else {
                    interaction.followUp({ content: `${executingUser} is wishing you a [happy birthday](${url} ), <@${targetUser.id}>!` });
                }

            })
            .catch(error => {
                console.error(error)
                interaction.followUp({ content: `Sorry, the API limit has been reached... Still, happy birthday <@${targetUser}>!` });
            });

    }

}
