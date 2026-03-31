const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require("@google/genai");
const { GEMINI_API_KEY } = require('../../config.json');
const { splitText } = require('../../utilities/text.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('gemini')
        .setDescription('Prompt Gemini from the comfort of Discord!')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addStringOption(string => string
            .setName('prompt')
            .setDescription('The prompt you wish to use.')
            .setRequired(true)
        ),

    async execute(interaction) {
        try {
            interaction.deferReply();

            const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
            const groundingTool = {
                googleSearch: {}
            };
            const config = {
                tools: [groundingTool],
            };
            const prompt = interaction.options.getString('prompt');
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config
            });
            const response = result.text;
            const arrayOfText = splitText(response, 4096);

            for (let index = 0; index < arrayOfText.length; index++) {
                const textSnippet = arrayOfText[index];

                const embed = new EmbedBuilder()
                .setAuthor({
                    name : '[REDACTED]',
                    iconURL: '[REDACTED]'
                })
                .setColor('#ff57f6')
                .setDescription(`${textSnippet}`)
                .setFooter({ text: 'Powered by Gemini. Have a nice day!' });

                setTimeout(() => {
                    interaction.followUp({ embeds: [embed] })
                }, index * 1000) // Rate limits the followUps to every 1 second
            }

        } catch (error) {
            console.error(error);
            interaction.followUp('Sorry, Gemini\'s response couldn\'t be displayed, or it isn\'t supported.');
        }
    }
}
