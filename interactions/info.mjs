import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { write, read, fetchAll, remove } from '../database/index.js';

export const name = 'Info';

export const command = new ContextMenuCommandBuilder().setName('Info').setType(2)
export default async (interaction, client) => {

    
    //console.log(interaction);
    if (interaction.commandName !== 'Info') return console.log('Logic Check:', interaction);
    await interaction.deferReply({ ephemeral: true });
    
    await interaction.followUp({ content: `SessionID: ${interaction.id}, TargetUsername: ${interaction.user.username}, TargetIsBot: ${interaction.user.bot}\n\nMaybe ban ${interaction.username}`, ephemeral: true });



};
