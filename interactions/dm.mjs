import { SlashCommandBuilder } from '@discordjs/builders';
import { write, read, fetchAll, remove } from '../database/index.js';

export const name = 'dm';

export const command = new SlashCommandBuilder()
    .setName('dm').setDescription('Handle direct messages.')
    .addUserOption((option) =>  option.setName('open').setDescription('Opens a conversation with target user.'))
    .addUserOption((option) =>  option.setName('close').setDescription('Closes a conversation with the target user.'))
    .addChannelOption((option) =>  option.setName('close-channel').setDescription('Closes a conversation thats associated with the target channel.'));
        
export default async (interaction, client) => {

    if (interaction.commandName !== 'dm') return;

    // Command options

    let open = interaction.options.getUser('open');
    let close = interaction.options.getUser('close');
    let closeChannel = interaction.options.getChannel('close-channel');
    
    if (open == null && close == null && closeChannel == null) return await interaction.reply({content: `Sorry **${interaction.user.username}**, but I couldn't find any options for this command.\n\nTry using the command like this \`/dm open\`` , ephemeral: true });

    if (open) {
        const guild = await read("set", { id: 'guild' });
        const messageChannel = await read("set", { id: 'messages' });
        await interaction.deferReply({ephemeral: true});
        
        try {
            await client.users.cache.get(open.id).send(`Hello, **${open.username}!** You have a new message from ${interaction.user.username}!\n\n*To reply, simply talk in this \`dm\` channel.*`);
            
            let thread = await client.guilds.cache.get(guild.value).channels.cache.get(messageChannel.value).threads.create({
                name: open.username,
                reason: 'Message Session',
                autoArchiveDuration: 1440,
            });
            
            thread.send(`Hello, **${open.username}!** You have a new message from ${interaction.user.username}!\n\n*To reply, simply talk in this \`dm\` channel.*`);
            
            client.messages.set(open.id, {
                id: open.id,
                thread: thread.id,
                token: client.webhook.token,
                tokenID: client.webhook.id,
                status: 'active'
            });
            
            const save = await write("mes", {
                id: open.id,
                thread: thread.id,
                token: client.webhook.token,
                tokenID: client.webhook.id,
                status: 'active'
            });

            interaction.reply({content: `I have created a dm with **${open.username}**.`, ephemeral: true });
        
        } catch (error) {
            if (error.code == 50007) {
                interaction.reply({content: `Sorry **${interaction.user.username}**, but I couldn't find any user with the username **${open.username}**. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`, ephemeral: true });
                message.delete();
            }
        }
    };

    if (close) {
        const guild = await read("set", { id: 'guild' });
        const messageChannel = await read("set", { id: 'messages' });

        try {

            let session = client.messages.get(close.id);
            
            if (session) {
                // Fetches the thread
                let thread = await client.guilds.cache.get(guild.value).channels.cache.get(session.thread);
                
                // Updates thread
                thread.setName(`[Closed] ${close.username}`);
                let closing = await thread.send(`Hello, **${close.username}!** Your conversation with **${interaction.user.username}** has been closed.`);
                
                // Removes persistent data
                await remove("mes", session.id);
                await client.messages.delete(session.id);
                
                try {

                    await client.users.cache.get(close.id).send(`Hello, **${close.username}!** Your conversation with **${interaction.user.username}** has been closed.`);
                    await thread.setArchived(true);

                    interaction.reply({content: `Your conversation with **${close.username}** has been closed.`, ephemeral: true });
                    
                } catch (error) {
                    if (error.code == 50007) {
                        closing.delete(); 
                        
                        await thread.send(`Hello, **${close.username}!** Your conversation with **${interaction.user.username}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        await thread.setArchived(true);

                        interaction.reply({content: `Your conversation with **${close.username}** has been closed.`, ephemeral: true });
                    }
                    
                }

            } else {
                interaction.reply({ content: `Could not find a conversation session with **${close.username}**.`, ephemeral: true });
            }
        
        } catch (error) {
            console.log(error);

        }

    };

    if (closeChannel) {
        const guild = await read("set", { id: 'guild' });
        const messageChannel = await read("set", { id: 'messages' });

        try {

            let session = client.messages.find(u => u.thread === closeChannel.id);
            let user = client.users.cache.get(session.id);
            
            if (session) {
                // Fetches the thread
                let thread = await client.guilds.cache.get(guild.value).channels.cache.get(session.thread);
                
                // Updates thread
                thread.setName(`[Closed] ${user.username}`);
                let closing = await thread.send(`Hello, **${user.username}!** Your conversation with **${interaction.user.username}** has been closed.`);
                
                // Removes persistent data
                await remove("mes", session.id);
                await client.messages.delete(session.id);
                
                try {

                    await user.send(`Hello, **${user.username}!** Your conversation with **${interaction.user.username}** has been closed.`);
                    await thread.setArchived(true);

                    interaction.reply({content: `Your conversation with **${user.username}** has been closed.`, ephemeral: true });
                    
                } catch (error) {
                    if (error.code == 50007) {
                        closing.delete(); 
                        
                        await thread.send(`Hello, **${user.username}!** Your conversation with **${interaction.user.username}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        await thread.setArchived(true);

                        interaction.reply({content: `Your conversation with **${user.username}** has been closed.`, ephemeral: true });
                    }
                    
                }

            } else {
                interaction.reply({ content: `Could not find a conversation session with **${close.username}**.`, ephemeral: true });
            }
        
        } catch (error) {
            console.log(error);

        }

    };
};
