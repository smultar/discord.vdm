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

            if (session) {
    
                try {

                    if (message.attachments?.first()) {
                        if (message.content) {
                            await client.users.cache.get(session.id).send(message.content);
                        }
    
                        await client.users.cache.get(session.id).send(message.attachments.first().attachment);
                        
                    } else {
                       await client.users.cache.get(session.id).send(message.content);
                    }
                    
                } catch (error) {
                    console.log(error)
                    if (error.code == 50007) {
                        message.channel.send(`Your message could not be delivered. This is usually because you don't share a server with **Recipient**`);
                        message.delete();
                    }
                }

            }
    
    
        } else {
            // Direct Messages

            // Ignores Self
            if (message.author.id == '888253387072749598') return;

            let session = client.messages.get(message.author.id);
            console.log(session)
    
            if (session) { 
                // Continue Session

                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`; 
    
                if (message.attachments?.first()) {
                    if (message.content) {
                        client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: session.thread })
                    }
                    
                    client.webhook.send({ content: message.attachments.first().attachment, username: message.author.username, avatarURL: avatar, threadId: session.thread })
                    
                } else {
                    client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: session.thread })
                }
    
    
            } else {
                console.log('correct')
                // Creates New Session
                let avatar = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=1024`;

                // Messages
                const guild = await read("set", { id: 'guild' });
                const messageChannel = await read("set", { id: 'messages' });

                let thread = await client.guilds.cache.get(guild.value).channels.cache.get(messageChannel.value).threads.create({
                    name: message.author.username,
                    reason: 'Message Session',
                    autoArchiveDuration: 60,
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
                        client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: thread.id })
                    }
                    
                    client.webhook.send({ content: message.attachments.first().attachment, username: message.author.username, avatarURL: avatar, threadId: thread.id })
                    
                } else {
                    client.webhook.send({ content: message.content, username: message.author.username, avatarURL: avatar, threadId: thread.id })
                }

            }
    
    
        }

    });
}