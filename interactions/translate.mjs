import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord.js';
import { write, read, fetchAll, remove } from '../database/index.js';
import transllate from 'translatte';

export const name = 'Translate';

export const command = new ContextMenuCommandBuilder().setName('Translate').setType(3)
export default async (interaction, client) => {

    if (interaction.commandName !== 'Translate') return;

    // Permission check
    //if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.reply({content: `Sorry **${interaction.member.displayName}**, but you don't have the required permissions to execute this command.`, ephemeral: true });

    // Configure options
    const guild = await read("set", { id: 'guild' });

    let confirmHealth = await client.guilds.cache.get(guild?.value);

    // Health check
    if (!confirmHealth) return await interaction.followUp({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });

    // Error handling
    try {

        // Respond to user's client
        await interaction.deferReply({ ephemeral: true });

        // Fetches the message
        let message = await interaction.options.getMessage('message');

        let translate = await transllate( message.content, {to: 'en', from: 'auto'} );

        await interaction.followUp({content: `**${message.author.username}**, (${translate.from.language.iso}): ${translate.text}`});

                
        } catch (error) {
            console.log(error);
        }
        

};
