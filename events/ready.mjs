import client from "../index.mjs";
import { WebhookClient } from 'discord.js';
import { write, read, fetchAll } from "../database/index.js";

export default async () => {

    client.once("ready", async () => {
// Database Instance
        // Sync Reminders
        const reminders = await fetchAll("rem");
        reminders.forEach(async (value) => {
            client.reminder.set(value.id, {
                thread: value.thread,
                token: value.token,
                tokenID: value.tokenID,
                status: value.status,
            });
        });

        // Sync Messages
        const messages = await fetchAll("mes"); console.log(messages)
        messages.forEach(async (value) => {

            client.messages.set(value.id, {
                id: value.id,
                thread: value.thread,
                token: value.token,
                tokenID: value.tokenID,
                status: value.status,
            });
        });

        // Sync Webhooks
        const webhook = await read("set", { id: 'webhook' });
        const token = await read("set", { id: 'webhookToken' });
        client.webhook = new WebhookClient({ id: webhook.value, token: token.value }); console.log(client.webhook);


// Discord Presence

        // Client Console Update
        client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
        
        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);
        
        // Discord Message
        client.guilds.cache.get('888254393554722847').channels.cache.get('935963236216504400').send(`${client.user.tag} has rebooted and loaded new changes.`); 
    })
}
