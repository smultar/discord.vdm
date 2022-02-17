import { SlashCommandBuilder } from '@discordjs/builders';


export const name = 'help';

export const command = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Learn more about the bot.')

export default async (interaction, client) => {
    interaction.reply({content: 'Help', ephimeral: true});
};
