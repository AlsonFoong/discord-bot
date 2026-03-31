const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Jimp = require('jimp');

const embed = new EmbedBuilder()
    .setAuthor({
        name : '[REDACTED]',
        iconURL: '[REDACTED]'
    })
    .setColor('#ff57f6')
    .setFooter({ text: 'Have a nice day!' });

module.exports = {

    data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Commands related to roles.')
    .setIntegrationTypes(0, 1)
    .setContexts(0)
    .addSubcommandGroup(commandGroup => commandGroup
        .setName('color')
        .setDescription('Commands related to role colors.')
        .addSubcommand(command => command
            .setName('view')
            .setDescription('View your current role color.'))
        .addSubcommand(command => command
            .setName('change')
            .setDescription('Change your current role color.')
            .addStringOption(option => option
                .setName('color')
                .setDescription('The HEX value of your new role color.')
                .setRequired(true)
            ))
    ),

    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subcommandGroup === 'color') {
            if (subcommand === 'view') {

                await interaction.deferReply()

                new Jimp(200, 200, interaction.member.displayHexColor, (error, image) => {
                    if (error) throw error;
                    image.getBuffer(Jimp.MIME_PNG, (error, imageFile) => {

                        if (error) throw error;
                        const roleColorImage = new AttachmentBuilder()
                        .setFile(imageFile)
                        .setName('image.png')
                        const replyEmbed = embed
                        .setTitle('Current Role Color')
                        .setDescription(`Hex color value: \`${interaction.member.displayHexColor}\``)
                        .setThumbnail('attachment://image.png')
                        interaction.followUp({ embeds: [replyEmbed], files: [roleColorImage] })

                    });
                });

            } else if (subcommand === 'change') {

                await interaction.deferReply({ flags: MessageFlags.Ephemeral })

                const chosenColor = interaction.options.getString('color')
                if (chosenColor === '000000' || chosenColor === '#000000') {
                    interaction.followUp({ content: "You cannot select this color." })
                    return;
                }

                interaction.member.roles.color.setColor(`${interaction.options.getString('color')}`)
                .then(() => {
                    interaction.followUp({ content: "Your role color has been successfully changed!" })
                })
                .catch((error) => {
                    interaction.followUp({ content: "An error occurred during execution. The provided hex value may not be valid." })
                })

            };
        };
    },

};