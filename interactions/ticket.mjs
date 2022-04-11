import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, WebhookClient } from 'discord.js';

import { write, read, fetchAll, update, remove } from '../database/index.js';
import { optionFetch } from '../utilities.mjs';

export const name = 'ticket';

export const command = new SlashCommandBuilder()
    .setName('ticket').setDescription('Handle direct messages.')
        .addSubcommand((subcommand) => 
            subcommand
                .setName('open')
                .setDescription('Opens a ticket with a user.')
                .addUserOption((option) =>  option.setName('user').setDescription('The user to open a ticket with.'))
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName('close')
                .setDescription('Closes a ticket with a user.')
                .addUserOption((option) =>  option.setName('user').setDescription('The user to open a ticket with.'))
                .addChannelOption((option) =>  option.setName('channel').setDescription('The channel to open the ticket in.'))
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName('manage')
                .setDescription('Manage tickets properties.')
                .addBooleanOption((option) =>  option.setName('alert').setDescription('Whether or not to alert the staff that the ticket has been created.'))
                .addBooleanOption((option) =>  option.setName('anonymous').setDescription('Whether to display who created and closed a ticket to the end user.'))
                .addBooleanOption((option) =>  option.setName('auto-close').setDescription('Whether to automatically close a ticket after a certain amount of time.'))
                .addChannelOption((option) =>  option.setName('channel').setDescription('Which channel to open the tickets in.'))
        )
        
export default async (interaction, client) => {

    if (interaction.commandName !== 'ticket') return;

    // Interaction Options
    let open, close, manage, user, channel, alert, anonymous, autoClose;

    // Respond to user's client
    await interaction.deferReply({ephemeral: true});

    // Configure options
    const guild = await read("set", { id: 'guild' });
    const messageChannel = await read("set", { id: 'messages' });

    // Command Differentiation
    switch (interaction.options.getSubcommand('open')) {
        

        // Open Ticket
        case 'open': { open = interaction.options.getUser('user');

            try {
                
                // Confirm user exists || Errors if user does not exist
                await client.users.cache.get(open.id).send(`Hello, **${open.username}!** You have a new message from ${interaction.user.username}!\n\n*To reply, simply talk in this \`dm\` channel.*`);

                // Creates a new thread for the staff to reply to the user
                let thread = await client.guilds.cache.get(guild.value).channels.cache.get(messageChannel.value).threads.create({
                    name: open.username,
                    reason: 'New Ticket Session',
                    autoArchiveDuration: 1440,
                });

                // Places a message in the thread
                thread.send(`Hello, **${open.username}!** You have a new message from ${interaction.user.username}!\n\n*To reply, simply talk in this \`dm\` channel.*`);
                
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
                interaction.followUp({content: `I have opened a ticket with **${open.username}**.`, ephemeral: true });

            } catch (error) {

                if (error.code == 50007) {
                    interaction.reply({content: `Sorry **${interaction.user.username}**, but I couldn't find any user with the username **${open.username}**. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`, ephemeral: true });
                }

                console.log(error);

            }

            break;
        }
        
        // Close Ticket
        case 'close': { close = (interaction.options.getUser('user')) ? interaction.options.getUser('user') : interaction.options.getChannel('channel');


            // Checks if user provided a user/channel
            if (!close) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but you need to specify a user or channel to close a ticket.`, ephemeral: true });

            try { 
                
                // Sets the user/channel to 
                let type = (close?.username) ? 'user' : 'channel';
                
                let session = (type == 'user') ? client.messages.get(close.id) : client.messages.find(u => u.thread === close.id); console.log(session);

                // Checks if theres a ticket thread in memory
                if (!session) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any ticket with the ${(type == 'user') ? 'user' : 'channel'} **${(type == 'user') ? close.username : close.name}**.`, ephemeral: true });

                // Simplifies the session
                let targetUser = (type == 'user') ? interaction.guild.members.cache.get(session.id).displayName : close.name;

                // Fetches ticket thread from memory
                let thread = await client.guilds.cache.get(guild.value).channels.cache.get(session.thread);
                
                // Updates ticket thread to closed
                thread.setName(`[Closed] ${targetUser}`);
                let closing = await thread.send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.`);
                
                // Removes ticket from memory and database
                await remove("mes", session.id);
                await client.messages.delete(session.id);

                // Alerts the user the ticket has been closed
                await client.users.cache.get(session.id).send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.`);
                await thread.setArchived(true);

                // Alerts the staff that a ticket has been closed
                interaction.followUp({content: `Your conversation with **${targetUser}** has been closed.`, ephemeral: true });


            } catch (error) {
                
                if (error.code == 50007) { closing.delete(); 
                    
                    // Alerts the user the ticket has been closed
                    await thread.send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                    await thread.setArchived(true);

                    interaction.followUp({content: `Your conversation with **${targetUser}** has been closed.`, ephemeral: true });
                }

                console.log(error);
                
            }

            break;
        }

        // Manage Ticket
        case 'manage': { manage = ((interaction.options.data[0].options.length <= 1) && (interaction.options.data[0].options.length != 0)) ? true : false; console.log(manage);

            // Checks if user provided a user/channel
            if (!manage) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but either you mentioned more then one setting, or you didn't specify a setting you would like to change.`, ephemeral: true });

            try {

                switch (interaction.options._hoistedOptions[0].name) {

                    case 'alert': {
                        // Fetches options object
                        let option = (await optionFetch(interaction, 'alert')).bool;

                        // Checks value and cancels if invalid
                        if (option == null) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but that isn't a valid option for the \`alert\` setting`, ephemeral: true }); 

                        // Saves setting to database
                        await update("set", {id: 'alert'}, { value: `${option}`});

                        return interaction.followUp({content: `Hey **${interaction.user.username}**, the \`alerts\` setting was successfully turned **${(option) ? 'on': 'off'}**\n\n*You${(option) ? '\'ll' : ' won\'t'} automatically get added to new tickets*`, ephemeral: true }); 

                    };

                    case 'anonymous': {
                        // Fetches options object
                        let option = (await optionFetch(interaction, 'anonymous')).bool;

                        // Checks value and cancels if invalid
                        if (option == null) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but that isn't a valid option for the \`anonymous\` setting`, ephemeral: true }); 
 
                        // Saves setting to database
                        await update("set", {id: 'anonymous'}, { value: `${option}`});
 
                        return interaction.followUp({content: `Hey **${interaction.user.username}**, the \`anonymous\` setting was successfully turned **${(option) ? 'on': 'off'}**\n\n*People **${(option) ? 'won\'t' : 'will'}** know it was you who **open** or **closed** tickets going forward.*`, ephemeral: true }); 
 
                    };

                    case 'auto-close': {
                        // Fetches options object
                        let option = (await optionFetch(interaction, 'auto-close')).bool;

                        // Checks value and cancels if invalid
                        if (option == null) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but that isn't a valid option for the \`auto-close\` setting`, ephemeral: true }); 
 
                        // Saves setting to database
                        await update("set", {id: 'auto-close'}, { value: `${option}`});
 
                        return interaction.followUp({content: `Hey **${interaction.user.username}**, the \`auto-close\` setting was successfully turned **${(option) ? 'on': 'off'}**\n\n*Tickets will now **${(option) ? 'close' : 'stay open'}** after extended durations of in-activity.*`, ephemeral: true }); 
 
                    };

                    case 'channel': {
                        // Fetches options object
                        let option = (await optionFetch(interaction, 'channel')).channel;

                        // Checks value and cancels if invalid
                        if (option == null) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but that isn't a valid option for the \`channel\` setting`, ephemeral: true }); 
                        

                        // Prepares interaction
                        const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('yes')
                                .setLabel('Yes')
                                .setStyle('SUCCESS'),
                        )
                        .addComponents(
                            new MessageButton()
                                .setCustomId('no')
                                .setLabel('No')
                                .setStyle('DANGER'),
                        )

                        // Prompt for confirmation
                        const confirmation = await interaction.followUp({content: `Are you sure you want to change the \`default ticket channel\` **${interaction.user.username}**?\n\n*Doing so will close **ALL** active tickets.*`, components: [row], ephemeral: true }); 
                        
                        // Filter for confirmation
                        const filter = i => { return i.user.id === interaction.user.id };
                        
                        // Listens for confirmation, cancels if no response
                        const response = await confirmation.awaitMessageComponent(filter, { componentType: 'BUTTON', max: 1, time: 900000 /* 15 minutes */ }); console.log(response);
                        
                        let answer = (response?.customId) ? response.customId : null; 
                        
                        await response.deferUpdate();
                        
                        if (answer == null) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but you didn't respond in time.`, ephemeral: true });
                        

                        if (answer == 'yes') { 
                            
                            let activeTickets = client.messages.size;

                            if (activeTickets != 0) {
                                
                                client.messages.forEach(async ticket => {
                                    // Simplifies the session
                                    let targetUser = interaction.guild.members.cache.get(ticket.id).displayName;
                                    
                                    // Fetches ticket thread from memory
                                    let thread = await client.guilds.cache.get(interaction.guild.id).channels.cache.get(ticket.thread);

                                    if (thread) {
                                        (thread.archived) ? await thread.setArchived(false) : await thread.setArchived(false);
                                        
                                        // Updates ticket thread to closed
                                        thread.setName(`[Closed] ${targetUser}`);
                                        let closing = await thread.send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.`);
                                        
                                        // Removes ticket from memory and database
                                        await remove("mes", ticket.id);
                                        await client.messages.delete(ticket.id);
                                        
                                        try {
                                            
                                            // Alerts the user the ticket has been closed
                                            await client.users.cache.get(ticket.id).send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.`);                                        
                                            await thread.setArchived(true);
                                            
                                        } catch (error) {
                                            
                                            if (error.code == 50007) {
                                                
                                                // Alerts the user the ticket has been closed
                                                await thread.send(`Hello, **${targetUser}!** Your conversation with **${interaction.user.username}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                                                await thread.setArchived(true);
                                                
                                            }
                                            
                                            console.log(error);
                                        }
                                        
                                    } else {

                                        // Removes ticket from memory and database
                                        await remove("mes", ticket.id);
                                        await client.messages.delete(ticket.id);
                                    }

                                });
    
                                await update("set", {id: 'messages'}, { value: `${option.id}`});
    
                                // Settings Pull
                                const messages = await read("set", { id: 'messages' }).then(value => value.dataValues);
                                const channel = await client.guilds.cache.get(guild.value).channels.cache.get(messages.value);
    
                                // Create Webhook
                                const webhook = await channel.createWebhook(client.user.username, { avatar: client.user.avatarURL(), reason: 'Self diagnostics repair' });
    
                                // Save Webhook
                                await update("set", {id: 'webhook'}, { value: webhook.id });
                                await update("set", {id: 'webhookToken'}, { value: webhook.token });
    
                                // Set Client Webhook
                                client.webhook = new WebhookClient({ id: webhook.id, token: webhook.token });
    
                                response.editReply({content: `Hey **${interaction.user.username}**, the default \`channel\` setting was successfully changed to <#${option.id}>. \`${activeTickets}\` tickets were closed.\n\n*All new tickets will be Tickets will now **open** in this channel*`, components: [], ephemeral: true }); 
                                
                            } else {

                                await update("set", {id: 'messages'}, { value: `${option.id}`});
    
                                // Settings Pull
                                const messages = await read("set", { id: 'messages' }).then(value => value.dataValues);
                                const channel = await client.guilds.cache.get(guild.value).channels.cache.get(messages.value);
    
                                // Create Webhook
                                const webhook = await channel.createWebhook(client.user.username, { avatar: client.user.avatarURL(), reason: 'Self diagnostics repair' });
    
                                // Save Webhook
                                await update("set", {id: 'webhook'}, { value: webhook.id });
                                await update("set", {id: 'webhookToken'}, { value: webhook.token });
    
                                // Set Client Webhook
                                client.webhook = new WebhookClient({ id: webhook.id, token: webhook.token });
    
                                response.editReply({content: `Hey **${interaction.user.username}**, the default \`channel\` setting was successfully changed to <#${option.id}>. \`${activeTickets}\` tickets were closed.\n\n*All new tickets will be Tickets will now **open** in this channel*`, components: [], ephemeral: true }); 
                                
                            }
                            
                        } else {

                            return response.editReply({content: `Nothing was changed, the \`channel\` settings remains untouched as they were **${interaction.user.username}**`, components: [], ephemeral: true }); 
                        }
 
                    };
                
                    default:
                        break;
                }

            } catch (error) {
                // Error Handling
                console.log(error);
            }

            break;
        }

        // No Subcommand
        default: {
            interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any options for this command.\n\nTry using the command like this \`/ticket open\`` , ephemeral: true });
        }

    };
};


