const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Represents a user on Discord.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addSubcommand(command => command
            .setName('info')
            .setDescription('Display information about a user.')
            .addUserOption(user => user
                .setName('user')
                .setDescription('The user whose information you want to retrieve.')
            )
            .addBooleanOption(boolean => boolean
                .setName('show-permissions')
                .setDescription('Whether or not to display the user\'s permissions.')
            ),
        )
        .addSubcommand(command => command
            .setName('avatar')
            .setDescription('Display a user\'s avatar.')
            .addUserOption(user => user
                .setName('user')
                .setDescription('The user whose avatar you want to view.')
            )
        ),

    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        await interaction.deferReply()
        
        if (subcommand === 'info') {

            if (!interaction.guild) {
                interaction.followUp({ content: 'You cannot run this command outside of a server.' })
                return;
            }

            const targetUser = interaction.options.getUser('user') ?? interaction.member.user;
            let targetMember = interaction.guild.members.fetch(`${targetUser.id}`)
                .then(member => targetMember = member);

            targetUser.fetch(true)
                .then(user => {

                    const userRoles = targetMember.roles.cache
                        // .filter(roles => roles.id !== '[REDACTED]')
                        .sort((a, b) => b.rawPosition - a.rawPosition);
                    let userRolesText = [];
                    let numberOfRoles = 0;

                    for (role of userRoles) {
                        numberOfRoles += 1;
                        userRolesText.push(role[1].toString())
                        // role is actually an array with 2 elements inside,
                        // the 1st being a string with the role ID...? and the 2nd being a Role object
                    };
                    userRolesText = userRolesText.join(', ');

                    const showPermissions = interaction.options.getBoolean('show-permissions');
                    const permissionsArray = targetMember.permissions.toArray();
                    if (permissionsArray.includes('Administrator')) {
                        permissionsArray.splice(permissionsArray.indexOf('Administrator'), 1, '! Adminstrator !')
                    };
                    permissionsArray.sort();
                    let userPermissionsText = [];
                    let numberOfPermissions = 0;

                    if (showPermissions) {
                        for (permission of permissionsArray) {
                            numberOfPermissions += 1;
                            userPermissionsText.push(`\`${permission}\``);
                        };
                        userPermissionsText = userPermissionsText.join(', ');
                    } else {
                        for (permission of permissionsArray) {
                            numberOfPermissions += 1;
                        }
                        userPermissionsText = 'To display permissions, run the </member info:1217507909446139994> command with `show-permissions` set to true.';
                    };

                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name : '[REDACTED]',
                        iconURL: '[REDACTED]'
                    })
                    .setFooter({ text: 'Have a nice day!' })
                    .setColor(user.hexAccentColor)
                    .setTitle('User Information')
                    .setDescription(`${user} is a member of **${interaction.guild.name}**!`)
                    .setThumbnail(user.avatarURL())
                    .setImage(user.bannerURL())
                    .addFields(
                        { name: 'Account Creation', value: `<t:${Date.parse(user.createdAt) / 1000}>`, inline: true },
                        { name: 'Server Join', value: `<t:${Math.trunc(targetMember.joinedTimestamp / 1000)}>`, inline: true },
                        { name: 'User ID', value: `\`${user.id}\``, inline: true },
                        { name: `Roles (${numberOfRoles})`, value: `${userRolesText}` },
                        { name: `Permissions (${numberOfPermissions})`, value: `${userPermissionsText}` }
                    );

                    interaction.followUp({ embeds: [embed] });

                });

        } else if (subcommand === 'avatar') {

            const targetUser = interaction.options.getUser('user') ?? interaction.member.user;
            // let targetMember = interaction.guild.members.fetch(`${targetUser.id}`)
            //     .then(member => targetMember = member);

            targetUser.fetch(true)
                .then(user => {

                    const embed = new EmbedBuilder()
                    .setAuthor({
                        name : '[REDACTED]',
                        iconURL: '[REDACTED]'
                    })
                    .setFooter({ text: 'Have a nice day!' })
                    .setColor(user.hexAccentColor)
                    .setTitle('User Avatar')
                    .setImage(`${user.avatarURL()}?size=4096`);

                    interaction.followUp({ embeds: [embed] });

                });

        };
    },

}