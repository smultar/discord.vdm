import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, remove, fetchAll } from '../database/index.js';

export default async () => {

    client.on('messageUpdate', async (oldMessage, newMessage) => { 
        if (oldMessage.stickers?.first()) return; if (oldMessage.type != 'DEFAULT') return; if (oldMessage.author == null) return;
        
        if (oldMessage.guild) { // Server

            if (oldMessage.author.id == client.user.id) return;
            if (oldMessage.webhookId) return;
            if (oldMessage.hasThread) return;

            let history = client.history.find(u => u.id === oldMessage.id);
            if (history == null) return; 

            if (history.type == 'server') {
                client.users.cache.get(history.user).dmChannel.messages.fetch(history.pair).then((target) => {
                    target.edit(newMessage.content);
                }).catch(() => {
                    console.log(`Couldn't delete a message, potentially lacking permissions or the message doesn't exist anymore.`);
                });
            }
    
        } else { // DM

            // Ignores messages from self
            if (oldMessage.author.id == client.user.id) return;

            // Locates history entry in memory
            let history = client.history.find(u => u.id === oldMessage.id);
            if (history == null) return;

            if (history.type == 'direct') {
                try {  
                    let avatar = `https://cdn.discordapp.com/avatars/${newMessage.author.id}/${newMessage.author.avatar}.png?size=1024`; 
                    
                    await client.webhook.editMessage(history.pair, {
                        threadId: history.thread,
                        content: newMessage.content,
                        username: newMessage.author.username,
                        avatarURL: avatar,
                    });

                } catch (e) {
                    console.log(e);
                }

            }

        }

    });
}