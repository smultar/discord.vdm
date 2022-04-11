import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { write, read, fetchAll, remove } from '../database/index.js';

export const name = 'Close_Ticket';

export const command = new ContextMenuCommandBuilder().setName('Close_Ticket').setType(3)
export default async (interaction, client) => {

    if (interaction.commandName !== 'Close_Ticket') return;

        console.log(interaction)
        
        let message = interaction.options.getMessage('message');

        // Configure options
        const guild = await read("set", { id: 'guild' });
        
        try {
            
            await interaction.deferReply({ ephemeral: true });

            // Fetches the ticket
            let session = client.messages.find(u => u.thread === interaction.channel.id); 
            
            // Checks if theres a ticket thread in memory
            if (!session) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any ticket with the user **${message.member.displayName}**.`, ephemeral: true });
    
            // Simplifies the session
            let targetUser = interaction.guild.members.cache.get(session.id).displayName;
    
            // Fetches ticket thread from memory
            let thread = await client.guilds.cache.get(guild.value).channels.cache.get(session.thread);
    
            if (thread) {
                
                // Unarchives the ticket thread
                (thread.archived) ? await thread.setArchived(false) : await thread.setArchived(false);
                
                // Updates ticket thread to closed
                thread.setName(`[Closed] ${targetUser}`);
                await thread.send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.`);
                
                // Removes ticket from memory and database
                await remove("mes", session.id);
                await client.messages.delete(session.id);
                
                try { // Alerts the user the ticket has been closed
                    
                    await client.users.cache.get(session.id).send(`Hello, **${targetUser}!** Your ticket with **${interaction.user.username}** has been closed.`);                                        
                    await thread.setArchived(true);
    
                    // Alerts the staff that a ticket has been closed
                    interaction.followUp({content: `Your ticket with **${targetUser}** has been closed.`, ephemeral: true });
     
                } catch (error) {
                    
                    if (error.code == 50007) { // Alerts the user the ticket has been closed
    
                        await thread.send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        await thread.setArchived(true);
                        
                    }
                    
                    console.log(error);
                }
                
            } else {
    
                // Removes ticket from memory and database
                await remove("mes", ticket.id);
                await client.messages.delete(ticket.id);
    
                // Alerts the staff that a ticket has been closed
                interaction.followUp({content: `Your ticket with **${targetUser}** has been closed.`, ephemeral: true });
    
            }
                            
        } catch (error) {
            console.log(error);
        }
        

};
