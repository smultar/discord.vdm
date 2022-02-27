import { SlashCommandBuilder } from '@discordjs/builders';


export const name = 'help';

export const command = new SlashCommandBuilder()
    .setName('help').setDescription('Learn more about the bot.')
    .addStringOption( option => option.setName('commands').setDescription('List of all the available commands.')
        .addChoices([
            ['about', 'about'],
            ['remind', 'remind'],
            ['reset', 'reset'],
            ['restart', 'remind'],
            ['freeze', 'remind'],
            ['dms', 'dm'],
        ])
    )






export default async (interaction, client) => {
    if (interaction.commandName !== 'help') return;

    console.log(interaction);
    interaction.reply({content: 'Help Command Stuff', ephemeral: true });
};
