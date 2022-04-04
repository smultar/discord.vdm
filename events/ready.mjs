import client from "../index.mjs";
import deploy from '../deploycommand.mjs'; 
import { WebhookClient } from 'discord.js';
import { write, read, fetchAll, remove, update } from "../database/index.js";

export default async () => {

    client.once("ready", async () => {
        // Database Synchronized To Maps/Hooks
        // Sync Reminders
        const reminders = await fetchAll("rem");
        reminders.forEach(async (value) => {

            console.log(value);

            client.reminders.set(value.id, {
                id: value.id,
                time: value.time,
                interval: value.interval,
                value: value.value,
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

        // Sync Webhooks
        const webhook = await read("set", { id: 'webhook' });
        const token = await read("set", { id: 'webhookToken' });

        client.webhook = new WebhookClient({ id: webhook.value, token: token.value });


        // Sync Threads
        const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
        const threadParent = await read("set", { id: 'messages' }).then(value => value.dataValues);
        const threads = await client.guilds.cache.get(guild.value).channels.cache.get(threadParent.value).threads.fetch();
        const archivedThreads = await client.guilds.cache.get(guild.value).channels.cache.get(threadParent.value).threads.fetchArchived();

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
            };

            console.log(e);
        };


        // Internal Application Tick

        // Reminder Tick
        setInterval(async () => {
                    const reminder = client.reminders.filter(value => value.time <= new Date().getTime());
                    
                    reminder.forEach(async (value) => {
                        console.log(value);
                        console.log(value.interval !== 'null')
                        if (value.interval !== 'null') {
        
                            const reminderTimeStamp = new Date(~~value.time + ~~value.interval);
        
                            const reminder = await update("rem", { id: value.id }, {
                                id: value.id,
                                time: reminderTimeStamp.getTime(),
                                interval: value.interval,
                                value: value.value,
                            });
        
                            client.reminders.set(value.id, {
                                id: value.id,
                                time: reminderTimeStamp.getTime(),
                                interval: value.interval,
                                value: value.value,
                            });
                            
                            console.log(client.reminders);
        
                            client.users.cache.get('203639901693018112').send(`${value.value}\n\nI'll remind you again on **${reminderTimeStamp}**`);
        
                        } else {
        
                            client.reminders.delete(value.id); console.log(client.reminders);
                            client.users.cache.get('203639901693018112').send(`${value.value}`);
                            await remove("rem", value.id);
        
                            const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
                            const messages = await read("set", { id: 'reminders' }).then(value => value.dataValues);
                            const channel = await client.guilds.cache.get(guild.value).channels.cache.get(messages.value);
                            
                            channel.messages.fetch(value.id).then((target) => {
                                target.delete();
                            }).catch(() => {
                                console.log('Could not delete a reminder message.');
                            });
                        }
        
                    });
        
        }, 15000);



        // Discord Presence
        // Client Console Update
        client.user.setActivity('your concerns.', { type: 'LISTENING', status: 'online'});

        
        // Check if there are any webhooks in the database

        // Check if there are any new threads

        // Check if there are any new reminders

        // Check if there are any new messages

        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);

        deploy();
    })
}
