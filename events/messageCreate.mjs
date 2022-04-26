import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, fetchAll } from '../database/index.js';

import settings from '../settings.json' assert {type: 'json'};

export default async () => {

    
    client.on('messageCreate', async (message) => {
        const guild = await read("set", { id: 'guild' });
    
        let blocked = client.blocked.find(u => u.id === message.author.id); if (blocked) return console.log('blocked');
        if (message.stickers?.first()) return; if (message.type != 'DEFAULT') return;
        
        
        
        if (message.guild) {
            // Health check
            let confirmHealth = await client.guilds.cache.get(guild?.value);
            if (!confirmHealth) return;

            // Server
            if (message.author.id == client.user.id) return;
            if (message.webhookId) return;
            if (message.hasThread) return;

            let session = client.messages.find(u => u.thread === message.channel.id);

            let history = {
                id: message.id,
                pair: null,
                thread: message.channel.id,
                user: null,
                type: 'server',
            }

            if (session) {
    
                try {

                    if (message.attachments?.first()) {
                        if (message.content) {

                            let carrier = await client.users.cache.get(session.id).send({ content: message.content, files: message.attachments.map(u => u.url)}); 
                            
                            // History Pair
                            history.user = session.id; history.pair = carrier.id; 

                            client.history.set(message.id, history);
                            setTimeout(() => { client.history.delete(message.id) }, 300000);

                        } else {
                            
                            let carrier = await client.users.cache.get(session.id).send({ files: message.attachments.map(u => u.url)});
                            
                            // History Pair 
                            history.user = session.id; history.pair = carrier.id;
                            
                            client.history.set(message.id, history);
                            setTimeout(() => { client.history.delete(message.id) }, 300000);
                        }
    
                        
                    } else {

                        let carrier = await client.users.cache.get(session.id).send(message.content);
                        
                        // History Pair
                        history.user = session.id; history.pair = carrier.id;
                        
                        client.history.set(message.id, history);
                        setTimeout(() => { client.history.delete(message.id) }, 300000);
                    }
                    
                } catch (error) {

                    console.log(error);

                    if (error.code == 50007) {
                        message.channel.send(`Your message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        message.delete();
                    }

                    if (error.name == 'TypeError') {
                        message.channel.send(`Your message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        message.delete();
                    }
                }

            }
    
    
        } else { // Direct Messages

            // Health check
            let confirmHealth = await client.guilds.cache.get(guild?.value);
            if (!confirmHealth) return message.reply(`Terribly sorry, ${message.author.username}, your message couldn't be sent, because I haven't been configured to send messages to a server.`);

            // Ignores messages from self
            if (message.author.id == client.user.id) return;

            // Creates history entry
            let history = {
                id: message.id,
                pair: null,
                thread: null,
                user: null,
                type: 'direct',
            }

            // Locates session in memory
            let session = client.messages.get(message.author.id);

            if (session) { // Continue Session

                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`; 
                
                // Error Handling
                try {
                    if (message.attachments?.first()) {
                        if (message.content) {

                            let carrier = await client.webhook.send({ files: message.attachments.map(u => u.url), content: message.content, username: message.author.username, avatarURL: avatar, threadId: session.thread });
                            
                            // History Pair
                            history.pair = carrier.id; history.thread = carrier.channel_id; client.history.set(message.id, history);
                            setTimeout(() => { client.history.delete(message.id) }, 300000);
    
                        } else {
    
                            let carrier = await client.webhook.send({ files: message.attachments.map(u => u.url), username: message.author.username, avatarURL: avatar, threadId: session.thread });
                            
                            // History Pair
                            history.pair = carrier.id; history.thread = carrier.channel_id; client.history.set(message.id, history);
                            setTimeout(() => { client.history.delete(message.id) }, 300000);
                        }
                        
                        
                    } else {
    
                        let carrier = await client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: session.thread });
                        
                        // History Pair
                        history.pair = carrier.id; history.thread = carrier.channel_id; client.history.set(message.id, history);
                        setTimeout(() => { client.history.delete(message.id) }, 300000);
                    }

                } catch (error) {
                    
                    if (error.code == 40005) {
                        if (message.content) {
                            
                            let carrier = await client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: session.thread });
                            await client.webhook.send({ content: `*${message.author.username} uploaded a file larger then \`8 MB\`, preview is unavailable*\n${message.attachments.map(u => u.url).toString()}`, username: message.author.username, avatarURL: avatar, threadId: session.thread });
                            
                            // History Pair
                            history.pair = carrier.id; history.thread = carrier.channel_id; client.history.set(message.id, history);
                            setTimeout(() => { client.history.delete(message.id) }, 300000);
    
                        } else {
    
                            let carrier = await client.webhook.send({ content: `*${message.author.username} uploaded a file larger then \`8 MB\`, preview is unavailable*\n${message.attachments.map(u => u.url).toString()}`, username: message.author.username, avatarURL: avatar, threadId: session.thread });
                            
                            // History Pair
                            history.pair = carrier.id; history.thread = carrier.channel_id; client.history.set(message.id, history);
                            setTimeout(() => { client.history.delete(message.id) }, 300000);
                        }

                    }
                }
    
    
            } else { // Start Session

                // Creates New Session
                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`;

                // Fetches settings
                const messageChannel = await read("set", { id: 'messages' });
                const alert = await read("set", { id: 'alert' });

                // Creates thread
                let thread = await client.guilds.cache.get(guild?.value).channels.cache.get(messageChannel.value).threads.create({
                    name: message.author.username,
                    reason: 'Message Session',
                    autoArchiveDuration: 1440,
                });

                // Stores thread in memory
                client.messages.set(message.author.id, {
                    id: message.author.id,
                    thread: thread.id,
                    token: client.webhook.token,
                    tokenID: client.webhook.id,
                    status: 'active'
                });

                // Stores thread in database
                const save = await write("mes", {
                    id: message.author.id,
                    thread: thread.id,
                    token: client.webhook.token,
                    tokenID: client.webhook.id,
                    status: 'active'
                });

                // Introduction
                let introduction = await thread.send(`**${message.author.username}** has opened a new ${(alert?.value == 'true') ? `<@&${settings.role}>` : 'ticket' }.\n\n*They joined discord <t:${(message.author.createdAt.getTime()/1000).toFixed(0)}:R> and have an id of \`${message.author.id}\`.*`);
                introduction.pin();

                // Original message contains an attachment
                if (message.attachments?.first()) {
                    if (message.content) {

                        let carrier = await client.webhook.send({ files: message.attachments.map(u => u.url), content: message.content, username: message.author.username, avatarURL: avatar, threadId: thread.id });

                        // History Pair
                        history.pair = carrier.id; client.history.set(message.id, history);
                        setTimeout(() => { client.history.delete(message.id) }, 300000);
                    
                    } else {

                        let carrier = await client.webhook.send({ files: message.attachments.map(u => u.url), username: message.author.username, avatarURL: avatar, threadId: thread.id })
                        
                        // History Pair
                        history.pair = carrier.id; client.history.set(message.id, history);
                        setTimeout(() => { client.history.delete(message.id) }, 300000);

                    }
                    

                } else {

                    let carrier = await client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: thread.id })
                    
                    // History Pair
                    history.pair = carrier.id; client.history.set(message.id, history);
                    setTimeout(() => { client.history.delete(message.id) }, 300000);
                }

            }
    
    
        }

    });
}