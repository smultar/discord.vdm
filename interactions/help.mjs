import { SlashCommandBuilder } from '@discordjs/builders';


export const name = 'help';

export const command = new SlashCommandBuilder()
    .setName('help').setDescription('Learn more about the bot.')
    .addSubcommand( sub => sub.setName('about').setDescription('Learn more about the bot.') )
    .addSubcommand( sub => sub.setName('support').setDescription('Get support for Mozu'));

export default async (interaction, client) => {

    interaction.reply({content: 'Help Command Stuff', ephemeral: true });
};
