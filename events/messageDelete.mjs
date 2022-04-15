import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, remove, fetchAll } from '../database/index.js';

export default async () => {

    client.on('messageDelete', async (message) => {
        
        let blocked = client.blocked.find(u => u?.id === message?.author?.id); if (blocked) return;
        if (message.stickers?.first()) return; if (message.type != 'DEFAULT') return; if (message.author == null) return;
        
        if (message.guild) { // Server
            // Reminder Override
            let reminder = client.reminders.find(u => u.id === message.id);
            
            if (reminder) {
                client.reminders.delete(reminder.id);
                await remove("rem", message.id);
            }

            if (message.author.id == client.user.id) return;
            if (message.webhookId) return;
            if (message.hasThread) return;

            let history = client.history.find(u => u.id === message.id);
            if (history == null) return; 

            if (history.type == 'server') {
                client.users.cache.get(history.user).dmChannel.messages.fetch(history.pair).then((target) => {
                    target.delete();
                }).catch(() => {
                    console.log(`Couldn't delete a message, potentially lacking permissions or the message doesn't exist anymore.`);
                });
            }
    
        } else { // DM

            // Ignores messages from self
            if (message.author.id == client.user.id) return;

            // Locates history entry in memory
            let history = client.history.find(u => u.id === message.id);
            if (history == null) return;

            if (history.type == 'direct') {
                try {   
                    await client.webhook.deleteMessage(history.pair, history.thread);

                } catch (e) {
                    console.log(e);
                }

            }

        }

    });
}