import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, remove, fetchAll } from '../database/index.js';

export default async () => {

    client.on('messageDelete', async (message) => { console.log(message);
        if (message.stickers?.first()) return; if (message.type == 'RECIPIENT_REMOVE') return; if (message.author == null) return;
        
        if (message.guild) { // Server
            // Reminder Override
            let reminder = client.reminders.find(u => u.id === message.id);
            
            if (reminder) {
                client.reminders.delete(reminder.id);
                await remove("rem", message.id);
            }

            if (message.author.id == '888253387072749598') return;
            if (message.webhookId) return;
            if (message.hasThread) return;

            console.log(message.id);
            console.log(client.reminders);
            
      
            let history = client.history.find(u => u.id === message.id);
            if (history == null) return; 

            if (history.type == 'server') {
                client.users.cache.get(history.user).dmChannel.messages.fetch(history.pair).then((target) => {
                    console.log(target);
                    target.delete();
                }).catch(() => {
                    console.log('Could not delete message');
                });
            }
    
        } else {
            // DM
            // Ignores Self
            if (message.author.id == '888253387072749598') return;

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