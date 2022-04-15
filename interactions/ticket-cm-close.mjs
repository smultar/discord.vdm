import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord.js';
import { write, read, fetchAll, remove } from '../database/index.js';

export const name = 'Close Ticket';

export const command = new ContextMenuCommandBuilder().setName('Close Ticket').setType(3)
export default async (interaction, client) => {

    if (interaction.commandName !== 'Close Ticket') return;

    // Permission check
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.followUp({content: `Sorry **${interaction.member.displayName}**, but you don't have the required permissions to execute this command.`, ephemeral: true });

    // Configure options
    const guild = await read("set", { id: 'guild' });
    const anonymous = await read("set", { id: 'anonymous' });


    let confirmHealth = await client.guilds.cache.get(guild?.value);

    // Health check
    if (!confirmHealth) return await interaction.followUp({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });

    // Error handling
    try {

        // Respond to user's client
        await interaction.deferReply({ ephemeral: true });

        // Fetches the ticket
        let session = client.messages.find(u => u.thread === interaction.channel.id); 
        
        // Pulls message from interaction
        let message = interaction.options.getMessage('message');
        
        // Checks if theres a ticket thread in memory
        if (!session) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any ticket with the user **${message.author.username}**.`, ephemeral: true });
        
        // Simplifies the session
        let targetUser = interaction.guild.members.cache.get(session.id).user.username;

        // Fetches ticket thread from memory
        let thread = await client.guilds.cache.get(guild?.value).channels.cache.get(session.thread);
            
        if (thread) {
                
            // Unarchives the ticket thread
            (thread.archived) ? await thread.setArchived(false) : await thread.setArchived(false);
            
            // Updates ticket thread to closed
            thread.setName(`[Closed] ${targetUser}`);
            await thread.send(`Hello, **${targetUser}!** Your conversation with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}** has been closed.`);
                
            // Removes ticket from memory and database
            await remove("mes", session.id);
            await client.messages.delete(session.id);
            
            try { // Alerts the user the ticket has been closed
            
                await client.users.cache.get(session.id).send(`Hello, **${targetUser}!** Your ticket with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}** has been closed.`);                                        
                await thread.setArchived(true);
    
                // Alerts the staff that a ticket has been closed
                interaction.followUp({content: `Your ticket with **${targetUser}** has been closed.`, ephemeral: true });
     
                } catch (error) {
                    
                    if (error.code == 50007) { // Alerts the user the ticket has been closed
                    
                        await thread.send(`Hello, **${targetUser}!** Your conversation with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        await thread.setArchived(true);
                        
                    }

                    if (error.name == 'TypeError') {
                        interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find the user. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.\n\nChances are, an extremely rare error occurred.`, ephemeral: true });
                    }
                    
                    console.log(error);
                }
                
        } else { // Thread wasn't found, however, the ticket was found in the database and memory.

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
