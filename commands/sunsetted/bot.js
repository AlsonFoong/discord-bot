const { SlashCommandBuilder, EmbedBuilder, IntegrationApplication } = require('discord.js');
const { OWNER_ID, PTERO_PANEL_TOKEN, PTERO_SERVER_ID } = require('../../config.json');
const { exec } = require('node:child_process');
const hostPanel = 'https://panel.solarhosting.cc/'

module.exports = {

    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('PRIVATE: Important [REDACTED] commands.')
        .setIntegrationTypes(0, 1)
        .setContexts(0, 1, 2)
        .addSubcommand(subcommand => subcommand
            .setName('info')
            .setDescription('PRIVATE: Retrieve server information.')
        )
        .addSubcommand(subcommand => subcommand
            .setName('restart')
            .setDescription('PRIVATE: Restart [REDACTED].')
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const userRunningId = interaction.user.id;

        if (subcommand === 'info' && userRunningId === OWNER_ID) {

            let attributes;
            let utilization;

            // Gets basic server information
            await fetch(`${hostPanel}/api/client/servers/${PTERO_SERVER_ID}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${PTERO_PANEL_TOKEN}` }
            })
                .then(response => response.json())
                .then(result => attributes = result.attributes)
                .catch(error => {
                    console.error(error);
                    interaction.editReply('Sorry, Pterodactyl\'s API response was unexpected.')
                    return;
                })

            // Gets resource usage
            await fetch(`${hostPanel}/api/client/servers/${PTERO_SERVER_ID}/resources`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${PTERO_PANEL_TOKEN}` }
            })
                .then(response => response.json())
                .then(result => utilization = result.attributes.resources)
                .catch(error => {
                    console.error(error);
                    interaction.editReply('Sorry, Pterodactyl\'s API response was unexpected.')
                    return;
                })

            // Basic server information
            const identifier = attributes.identifier;
            const name = attributes.name;
            const description = attributes.description;
            const node = attributes.node;
            const is_node_under_maintenance = attributes.is_node_under_maintenance ? 'Yes' : 'No';
            const renewal = attributes.renewal;
            const limits = attributes.limits;
            const allocations = attributes.relationships.allocations.data[0].attributes;

            // Resource usage
            function bytesConversion(bytes, to) {
                to = to.toUpperCase()
                if (to === 'KB') {
                    return (bytes / 1000).toFixed(2)
                } else if (to === 'MB') {
                    return (bytes / 1000000).toFixed(2);
                } else if (to === 'GB') {
                    return (bytes / 1000000000).toFixed(2);
                }
            }

            const cpu = (utilization.cpu_absolute).toFixed(2);
            const cpuLimit = limits.cpu;
            const memory = bytesConversion(utilization.memory_bytes, 'MB')
            const memoryLimit = limits.memory;
            const disk = bytesConversion(utilization.disk_bytes, 'MB')
            const diskLimit = limits.disk;
            const networkTransmit = bytesConversion(utilization.network_tx_bytes, 'KB');
            const networkReceive = bytesConversion(utilization.network_rx_bytes, 'KB');
            const uptimeInHours = (utilization.uptime / 1000 / 60 / 60).toFixed(2);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name : '[REDACTED]',
                    iconURL: '[REDACTED]'
                })
                .setColor('#ff57f6')
                .setTitle('Server Information')
                .setDescription(`[${identifier}] **${name}**\n${description}`)
                .addFields(
                    { name: 'Node', value: `${node}`, inline: true },
                    { name: 'Under Maintenance?', value: `${is_node_under_maintenance}`, inline: true },
                    { name: 'Renewal Deadline', value: `${renewal} days`, inline: true },
                    { name: 'CPU', value: `${cpu}/${cpuLimit}%`, inline: true },
                    { name: 'Memory', value: `${memory}/${memoryLimit} MB`, inline: true },
                    { name: 'Disk', value: `${disk}/${diskLimit} MB`, inline: true },
                    { name: 'Transmit', value: `${networkTransmit} KB`, inline: true },
                    { name: 'Receive', value: `${networkReceive} KB`, inline: true },
                    { name: 'Uptime', value: `${uptimeInHours} hours`, inline: true },
                    { name: 'IP Address', value: `${allocations.ip}`, inline: true },
                    { name: 'Port', value: `${allocations.port}`, inline: true }
                )
                .setFooter({ text: 'Have a nice day!' })

            interaction.editReply({ embeds: [embed] })
                .catch(error => console.error(error))
            
        } else if (subcommand === 'restart' && userRunningId === OWNER_ID) {

            await interaction.editReply('Restarting [REDACTED]...');

            // Fetch API doesn't work for some reason (400), cURL works though
            exec(`curl ${hostPanel}/api/client/servers/${PTERO_SERVER_ID}/power \
                -H 'Accept: application/json' \
                -H 'Content-Type: application/json' \
                -H 'Authorization: Bearer ${PTERO_PANEL_TOKEN}' \
                -X POST \
                -d '{
                "signal": "restart"
            }'`, (error => {
                // Only runs when command is executed outside of the server... for obvious reasons
                if (!error) {
                    interaction.editReply('The restart process has successfully been executed on the server.');
                    return;
                }
                console.error(error);
                interaction.editReply('Sorry, the restart failed.');
            }))

        } else {
            interaction.editReply({ content: 'You cannot run this command.' });
        }

    }

}