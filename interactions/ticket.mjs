import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, WebhookClient, Permissions } from 'discord.js';

import { write, read, fetchAll, update, remove } from '../database/index.js';
import { optionFetch } from '../utilities.mjs';

import settings from '../settings.json';


export const name = 'ticket';

export const command = new SlashCommandBuilder()
    .setName('ticket').setDescription('Handle direct messages.')
        .addSubcommand((subcommand) => 
            subcommand
                .setName('block')
                .setDescription('Prevents a user from having anymore communication with the bot.')
                .addUserOption((option) =>  option.setName('user').setDescription('Which user should be blocked.'))
                .addStringOption((option) =>  option.setName('because').setDescription('Reason for blocking the user. (Optional)'))
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName('unblock')
                .setDescription('Notifies and unblocks a user from the bot, allowing communication once more.')
                .addUserOption((option) =>  option.setName('user').setDescription('Which user should be unblocked.'))
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName('open')
                .setDescription('Opens a ticket with a user.')
                .addUserOption((option) =>  option.setName('user').setDescription('Which user to open a ticket with.'))
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName('close')
                .setDescription('Closes a ticket with a user.')
                .addUserOption((option) =>  option.setName('user').setDescription('Which user to close the ticket with.'))
                .addChannelOption((option) =>  option.setName('channel').setDescription('Which ticket to close.'))
        )

        .addSubcommand((subcommand) => 
            subcommand
                .setName('manage')
                .setDescription('Manage tickets properties.')
                .addBooleanOption((option) =>  option.setName('alert').setDescription('Whether or not to alert the staff that the ticket has been created.'))
                .addBooleanOption((option) =>  option.setName('anonymous').setDescription('Whether to display who created and closed a ticket to the end user.'))
                .addBooleanOption((option) =>  option.setName('auto-close').setDescription('Whether to automatically close a ticket after a certain amount of time.'))
                .addChannelOption((option) =>  option.setName('channel').setDescription('Which channel to open tickets in.'))
        )
        
export default async (interaction, client) => {

    if (interaction.commandName !== 'ticket') return;

    // Interaction Options
    let open, close, manage;

    // Respond to user's client
    await interaction.deferReply({ephemeral: true});

    // Permission check
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return interaction.followUp({content: `Sorry **${interaction.member.displayName}**, but you don't have the required permissions to execute this command.`, ephemeral: true });

    // Configure options
    const guild = await read("set", { id: 'guild' });
    const messageChannel = await read("set", { id: 'messages' });
    const anonymous = await read("set", { id: 'anonymous' });

    // Command Differentiation
    switch (interaction.options.getSubcommand('open')) {

        // Block Ticket
        case 'unblock': { open = interaction.options.getUser('user');
            
            // Health Check
            let confirmHealth = await client.guilds.cache.get(guild?.value);

            // Health check
            if (!confirmHealth) return await interaction.followUp({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });
        

            // Error Handling
            try {
                
                // Fetches a possible ticket
                let session = client.blocked.find(u => u.id === open.id); 
                
                // Fetch user
                let targetUser = open.username;

                // Checks if theres a ticket thread in memory
                if (!session) return interaction.followUp({content: `Sorry **${interaction.member.displayName}**, but **${targetUser}** isn't blocked.`, ephemeral: true });
        
                // Confirm user exists || Errors if user does not exist
                await client.users.cache.get(open.id).send(`Hey **${targetUser}!**, I have great news, you now can communicate with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}**!\n\n*If you send a message, a new \`ticket\` will be opened.*`);

                // Removes a blocked user in memory
                client.blocked.delete(session.id);

                // Removes a blocked user in the database
                await remove("blo", session.id);

                // Alerts the staff that a ticket has been created
                interaction.followUp({content: `**${targetUser}** was unotified that they were unblocked.`, ephemeral: true });

            } catch (error) {

                if (error.code == 50007) {
                    interaction.followUp({content: `**${targetUser}** was unblocked, however i'm sorry **${interaction.user.username}** I couldn't deliver the notification to them, as this is usually because you don't share a server with the **Recipient**, or they have DMs disabled.`, ephemeral: true });
                }
                
                if (error.name == 'TypeError') {
                    interaction.followUp({content: `Sorry **${interaction.user.username}**, an extremely rare error occurred on my end.`, ephemeral: true });
                }

                console.log(error);

            }

            break;
        }
  
        // Block Ticket
        case 'block': { open = interaction.options.getUser('user');
            
            // Health Check
            let confirmHealth = await client.guilds.cache.get(guild?.value);

            // Health check
            if (!confirmHealth) return await interaction.followUp({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });
        

            // Error Handling
            try { let reason = await interaction.options.getString('because');
                
                // Fetches a possible ticket
                let session = client.blocked.find(u => u.id === open.id); 
                
                // Fetch user
                let targetUser = open.username;

                // Checks if theres a ticket thread in memory
                if (session) return interaction.followUp({content: `Sorry **${interaction.member.displayName}**, but **${targetUser}** is already blocked.`, ephemeral: true });
        
                // Confirm user exists || Errors if user does not exist
                await client.users.cache.get(open.id).send(`Unfortunately **${targetUser}**, the decision has been made, you no longer can communicate with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}**${(reason) ? `, because ${reason}` : '!'}\n\n*You will received a notification, for when you are allowed to talk in this \`dm\` channel.*`);

                // Creates a new ticket in memory
                client.blocked.set(open.id, {
                    id: open.id,
                    reason: reason,
                    time: ((Date.now())/1000).toFixed(0),
                });

                // Creates a new ticket in the database
                const save = await write("blo", {
                    id: open.id,
                    reason: reason,
                    time: `${((Date.now())/1000).toFixed(0)}`,
                });

                // Alerts the staff that a ticket has been created
                interaction.followUp({content: `**${targetUser}** was notified that they were blocked.`, ephemeral: true });

            } catch (error) {

                if (error.code == 50007) {
                    interaction.followUp({content: `**${targetUser}** were blocked, however i'm sorry **${interaction.user.username}** I couldn't deliver the notification to them, as this is usually because you don't share a server with the **Recipient**, or they have DMs disabled.`, ephemeral: true });
                }
                
                if (error.name == 'TypeError') {
                    interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find the user.\n\nChances are, an extremely rare error occurred on my end.`, ephemeral: true });
                }

                console.log(error);

            }

            break;
        }

        // Open Ticket
        case 'open': { open = interaction.options.getUser('user');
            
            // Health Check
            let confirmHealth = await client.guilds.cache.get(guild?.value);

            // Health check
            if (!confirmHealth) return await interaction.followUp({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });
        

            // Error Handling
            try {
                
                // Fetches a possible ticket
                let session = client.messages.find(u => u.id === open.id); 
                
                // Fetch user
                let targetUser = open.username;

                // Checks if theres a ticket thread in memory
                if (session) return interaction.followUp({content: `Sorry **${interaction.member.displayName}**, but there already is an open ticket with **${targetUser}**.`, ephemeral: true });
        
                // Confirm user exists || Errors if user does not exist
                await client.users.cache.get(open.id).send(`Hello, **${targetUser}!** You have a new message from **${ (anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name }**!\n\n*To reply, simply talk in this \`dm\` channel.*`);

                // Creates a new thread for the staff to reply to the user
                let thread = await client.guilds.cache.get(guild?.value).channels.cache.get(messageChannel.value).threads.create({
                    name: targetUser,
                    reason: 'New Ticket Session',
                    autoArchiveDuration: 1440,
                });

                // Fetches settings
                const alert = await read("set", { id: 'alert' });

                // Introduction
                let introduction = await thread.send(`**${interaction.user.username}** has opened a new ${(alert?.value == 'true') ? `<@&${settings.role}>` : 'ticket' } for **${targetUser}**.\n\n*They joined discord <t:${(open.createdAt.getTime()/1000).toFixed(0)}:R> and have an id of \`${open.id}\`.*`);
                introduction.pin();

                // Places a message in the thread
                thread.send(`Hello, **${targetUser}!** You have a new message from **${ (anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name }**!\n\n*To reply, simply talk in this \`dm\` channel.*`);
                
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
                    interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any user with the username **${open.username}**. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`, ephemeral: true });
                }
                
                if (error.name == 'TypeError') {
                    interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find the user.\n\nChances are, an extremely rare error occurred on my end.`, ephemeral: true });
                }

                console.log(error);

            }

            break;
        }
        
        // Close Ticket
        case 'close': { close = (interaction.options.getUser('user')) ? interaction.options.getUser('user') : interaction.options.getChannel('channel');
            // Health Check
            let confirmHealth = await client.guilds.cache.get(guild?.value);

            if (!confirmHealth) return await interaction.followUp({ content: `Sorry **${interaction.user.username}**, unfortunately this bot hasn't been configured yet, try again later.`, ephemeral: true });
        

            // Checks if user provided a user/channel
            if (!close) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but you need to specify a user or channel to close a ticket.`, ephemeral: true });

            try { 
                
                // Sets the user/channel to 
                let type = (close?.username) ? 'user' : 'channel';
                
                let session = (type == 'user') ? client.messages.get(close.id) : client.messages.find(u => u.thread === close.id); console.log(session);

                // Checks if theres a ticket thread in memory
                if (!session) return interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find any ticket with the ${(type == 'user') ? 'user' : 'channel'} **${(type == 'user') ? close.username : close.name}**.`, ephemeral: true });

                // Simplifies the session
                let targetUser = (type == 'user') ? close.username : close.name;

                // Fetches ticket thread from memory
                let thread = await client.guilds.cache.get(guild?.value).channels.cache.get(session.thread);
                
                // Updates ticket thread to closed
                thread.setName(`[Closed] ${targetUser}`);
                let closing = await thread.send(`Hello, **${targetUser}!** Your conversation with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}** has been closed.`);
                
                // Removes ticket from memory and database
                await remove("mes", session.id);
                await client.messages.delete(session.id);

                // Alerts the user the ticket has been closed
                await client.users.cache.get(session.id).send(`Hello, **${targetUser}!** Your conversation with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}** has been closed.`);
                await thread.setArchived(true);

                // Alerts the staff that a ticket has been closed
                interaction.followUp({content: `Your conversation with **${targetUser}** has been closed.`, ephemeral: true });


            } catch (error) {
                
                if (error.code == 50007) {
                    
                    // Alerts the user the ticket has been closed
                    await thread.send(`Hello, **${targetUser}!** Your conversation with **${(anonymous?.value == 'false') ? interaction.user.username : interaction.guild.name}** has been closed.\n\nHowever this message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                    await thread.setArchived(true);

                    interaction.followUp({content: `Your conversation with **${targetUser}** has been closed.`, ephemeral: true });
                }

                if (error.name == 'TypeError') {
                    interaction.followUp({content: `Sorry **${interaction.user.username}**, but I couldn't find the user.\n\nChances are, an extremely rare error occurred on my end.`, ephemeral: true });
                }

                console.log(error);
                
            }

            break;
        }

        // Manage Ticket
        case 'manage': { manage = ((interaction.options.data[0].options.length <= 1) && (interaction.options.data[0].options.length != 0)) ? true : false;

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
                         
                        console.log(option);

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
                                await update("set", {id: 'guild'}, { value: `${option.guild.id}`});
    
                                // Settings Pull
                                const messages = await read("set", { id: 'messages' }).then(value => value.dataValues);
                                const channel = await client.guilds.cache.get(guild?.value).channels.cache.get(messages.value);
    
                                // Create Webhook
                                const webhook = await channel.createWebhook(client.user.username, { avatar: client.user.avatarURL(), reason: 'Self diagnostics repair' });
    
                                // Save Webhook
                                await update("set", {id: 'webhook'}, { value: webhook.id });
                                await update("set", {id: 'webhookToken'}, { value: webhook.token });
    
                                // Set Client Webhook
                                client.webhook = new WebhookClient({ id: webhook.id, token: webhook.token });
    
                                response.editReply({content: `Hey **${interaction.user.username}**, the default \`channel\` setting was successfully changed to <#${option.id}>. \`${activeTickets}\` tickets were closed.\n\n*All new tickets will be Tickets will now **open** in this channel*`, components: [], ephemeral: true }); 
                                
                            } else {

                                let save = await update("set", {id: 'messages'}, { value: `${option.id}`});

                                if (save[0] == 0) await write("set", {
                                    id: 'messages',
                                    value: `${option.id}`,
                                });

                                if (save[0] == 0) await write("set", {
                                    id: 'guild',
                                    value: `${interaction.guild.id}`,
                                });
                                
                                let messages = await read("set", { id: 'messages' }).then(data => data?.value);

                                // Settings Pull
                                const channel = await client.guilds.cache.get(interaction.guild.id).channels.cache.get(messages);
    
                                // Create Webhook
                                const webhook = await channel.createWebhook(client.user.username, { avatar: client.user.avatarURL(), reason: 'Self diagnostics repair' });
    
                                // Save Webhook
                                if (save[0] == 0) await write("set", {
                                    id: 'webhook',
                                    value: `${webhook.id}`,
                                });

                                if (save[0] == 0) await write("set", {
                                    id: 'webhookToken',
                                    value: `${webhook.token}`,
                                });
                                
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


