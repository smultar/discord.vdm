import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { write, read, fetchAll, remove } from '../database/index.js';

export const name = 'ticket-cm-close';

export const command = new ContextMenuCommandBuilder().setName('Open Ticket').setType(2)
export default async (interaction, client) => {

    
    //console.log(interaction);
    //if (interaction.commandName !== 'dm') return;


};
