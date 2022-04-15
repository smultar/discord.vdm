import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { Permissions } from 'discord.js';
import { write, read, fetchAll, remove } from '../database/index.js';

export const name = 'Open Ticket';

export const command = new ContextMenuCommandBuilder().setName('Open Ticket').setType(2)
export default async (interaction, client) => {
    
    if (interaction.commandName !== 'Open Ticket') return;
    
    // Permission check
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.followUp({content: `Sorry **${interaction.member.displayName}**, but you don't have the required permissions to execute this command.`, ephemeral: true });

    // Configure options
    const guild = await read("set", { id: 'guild' });
    const messageChannel = await read("set", { id: 'messages' });

    let confirmHealth = await client.guilds.cache.get(guild.value);

    // Health check
    if (!confirmHealth) return await interaction.Reply({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });

    // Fetches user from interaction
    let open = interaction.options.getUser('user');

    // Error handling
    try {
        
        // Respond to user's client
        await interaction.deferReply({ ephemeral: true });

        // Fetches a possible ticket
        let session = client.messages.find(u => u.id === interaction.targetId); 

        // Checks if theres a ticket thread in memory
        if (session) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but there already is an open ticket with **${interaction.targetMember.displayName}**.`, ephemeral: true });
        
        // Constructs target user
        let targetUser = (interaction.guild.members.cache.get(open.id)?.displayName) ? interaction.guild.members.cache.get(open.id).displayName : open.username;

        // Confirm user exists || Errors if user does not exist
        await client.users.cache.get(open.id).send(`Hello, **${targetUser}!** You have a new message from ${interaction.user.username}!\n\n*To reply, simply talk in this \`dm\` channel.*`);

        // Creates a new thread for the staff to reply to the user
        let thread = await client.guilds.cache.get(guild.value).channels.cache.get(messageChannel.value).threads.create({
            name: targetUser,
            reason: 'New Ticket Session',
            autoArchiveDuration: 1440,
        });

        // Places a message in the thread
        thread.send(`Hello, **${targetUser}!** You have a new message from ${interaction.user.username}!\n\n*To reply, simply talk in this \`dm\` channel.*`);
            
        // Creates a new ticket in memory
        client.messages.set(open.id, {
            id: open.id,
            thread: thread.id,
            token: client.webhook.token,
            tokenID: client.webhook.id,
            status: 'active'
        });

        // Creates a new ticket in the database
        const save = await write("mes", {
            id: open.id,
            thread: thread.id,
            token: client.webhook.token,
            tokenID: client.webhook.id,
            status: 'active'
        });

        // Alerts the staff that a ticket has been created
        interaction.followUp({content: `I have opened a ticket with **${targetUser}**.`, ephemeral: true });

    } catch (error) {

        if (error.code == 50007) {
            interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any user with the username **${targetUser}**. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`, ephemeral: true });
        }
                
        if (error.name == 'TypeError') {
            interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find the user. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.\n\nChances are, an extremely rare error occurred.`, ephemeral: true });
        }
        
        console.log(error);
        
    }

};
