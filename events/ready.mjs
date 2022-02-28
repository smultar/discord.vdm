import client from "../index.mjs";
import deploy from '../deploycommand.mjs'; 
import { WebhookClient } from 'discord.js';
import { write, read, fetchAll, remove, update } from "../database/index.js";

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
        const messages = await fetchAll("mes");
        messages.forEach(async (value) => {
            //await remove("mes", value.id); console.log(remove);
            client.messages.set(value.id, {
                id: value.id,
                thread: value.thread,
                token: value.token,
                tokenID: value.tokenID,
                status: value.status,
            });
        });

        console.log(messages);

        // Sync Webhooks
        const webhook = await read("set", { id: 'webhook' });
        const token = await read("set", { id: 'webhookToken' });

        client.webhook = new WebhookClient({ id: webhook.value, token: token.value });

        // Sync Settings


        // Sync Threads
        const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
        const threadParent = await read("set", { id: 'messages' }).then(value => value.dataValues);
        const threads = await client.guilds.cache.get(guild.value).channels.cache.get(threadParent.value).threads.fetch();
        const archivedThreads = await client.guilds.cache.get(guild.value).channels.cache.get(threadParent.value).threads.fetchArchived();

        console.log(threads);
        console.log(archivedThreads);
        
        
        //const removeItem = await remove("set", '209129015154311171'); console.log(remove);


        // Self Diagnostics
        try {

            // Webhook Check
            let webhookCheck = await client.webhook.send(`Checking self integrity`); await client.webhook.deleteMessage(webhookCheck.id);

        } catch (e) {

            switch (e.code) {
                case 10015: {

                    let settings = await fetchAll("set"); console.log(settings); settings = settings.map(value => value.dataValues);

                    // Settings Pull
                    const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
                    const messages = await read("set", { id: 'messages' }).then(value => value.dataValues);
                    const channel = await client.guilds.cache.get(guild.value).channels.cache.get(messages.value);
                    
                    // Create Webhook
                    const webhook = await channel.createWebhook(client.user.username, { avatar: client.user.avatarURL(), reason: 'Self diagnostics repair' });

                    // Save Webhook
                    await update("set", {id: 'webhook'}, { value: webhook.id });
                    await update("set", {id: 'webhookToken'}, { value: webhook.token });

                    // Set Client Webhook
                    client.webhook = new WebhookClient({ id: webhook.id, token: webhook.token });


                } break;
            
                default:
                    break;
            }

            console.log(e);
        }



// Discord Presence

        // Client Console Update
        client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
        
        // Check if there are any webhooks in the database

        // Check if there are any new threads

        // Check if there are any new reminders

        // Check if there are any new messages

        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);

        deploy();
    })
}
