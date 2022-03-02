import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, fetchAll } from '../database/index.js';

export default async () => {

    client.on('messageCreate', async (message) => {
        if (message.stickers?.first()) return; if (message.type == 'RECIPIENT_REMOVE') return;
    
        if (message.guild) {
            // Server
            if (message.author.id == '888253387072749598') return;
            if (message.webhookId) return;
            if (message.hasThread) return;
            console.log(message);

      
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
                    console.log(error)
                    if (error.code == 50007) {
                        message.channel.send(`Your message could not be delivered. This is usually because you don't share a server with **Recipient**, or they have DMs disabled.`);
                        message.delete();
                    }
                }

            }
    
    
        } else {
            
            // Direct Messages

            // Ignores Self
            if (message.author.id == '888253387072749598') return;

            let history = {
                id: message.id,
                pair: null,
                thread: null,
                user: null,
                type: 'direct',
            }

            let session = client.messages.get(message.author.id);

            if (session) { 
                // Continue Session

                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`; 
                
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
    
    
            } else {
                console.log('New Session');
                // Creates New Session
                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`;

                // Messages
                const guild = await read("set", { id: 'guild' });
                const messageChannel = await read("set", { id: 'messages' });

                let thread = await client.guilds.cache.get(guild.value).channels.cache.get(messageChannel.value).threads.create({
                    name: message.author.username,
                    reason: 'Message Session',
                    autoArchiveDuration: 1440,
                });

                client.messages.set(message.author.id, {
                    id: message.author.id,
                    thread: thread.id,
                    token: client.webhook.token,
                    tokenID: client.webhook.id,
                    status: 'active'
                });

                const save = await write("mes", {
                    id: message.author.id,
                    thread: thread.id,
                    token: client.webhook.token,
                    tokenID: client.webhook.id,
                    status: 'active'
                })

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