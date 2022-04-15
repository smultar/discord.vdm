import client from "../index.mjs";
import deploy from '../deploycommand.mjs'; 
import { WebhookClient } from 'discord.js';
import { write, read, fetchAll, remove, update } from "../database/index.js";

export default async () => {

    client.once("ready", async () => {
        // // Loads database into memory
        // Sync Reminders
        const reminders = await fetchAll("rem");
        reminders.forEach(async (value) => {
            client.reminders.set(value.id, {
                id: value.id,
                time: value.time,
                interval: value.interval,
                value: value.value,
            });
        });

        // Sync Tickets
        const messages = await fetchAll("mes");
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

        client.webhook = new WebhookClient({ id: webhook?.value, token: token?.value });

        // // Self Diagnostics
        // Checks if bot is configured correctly
        const guild = await read("set", { id: 'guild' }).then(value => value?.dataValues);

        // Optional settings
        try {

            // Alerts
            // Reads settings
            let alert = await read("set", { id: 'alert' });
            
            // Checks if alert exists and creates an entry it if it doesn't
            (alert?.value) ? null : await write("set", {
                id: 'alert',
                value: 'false',
            });

            // Anonymous
            // Reads settings
            let anonymous = await read("set", { id: 'anonymous' });
            
            // Checks if alert exists and creates an entry it if it doesn't
            (anonymous?.value) ? null : await write("set", {
                id: 'anonymous',
                value: 'false',
            });
            
            // Anonymous
            // Reads settings
            let autoClose = await read("set", { id: 'auto-close' });
            
            // Checks if alert exists and creates an entry it if it doesn't
            (autoClose?.value) ? null : await write("set", {
                id: 'auto-close',
                value: 'false',
            });

            console.log('Settings Synchronized', alert, anonymous, autoClose);

        } catch (e) {
            console.error(e);
        }
        
        // Webhook handler
        try {
            if (!guild?.value) return console.log(`Dormant mode enabled, ${client.user.username} isn't configured yet!`);

            // Webhook Check
            let webhookCheck = await client.webhook.send(`Checking self integrity`); await client.webhook.deleteMessage(webhookCheck.id);

        } catch (e) {

            switch (e.code) {
                case 10015: {

                    let settings = await fetchAll("set"); console.log(settings); settings = settings.map(value => value.dataValues);

                    // Settings Pull
                    const guild = await read("set", { id: 'guild' }).then(value => value.dataValues);
                    const messages = await read("set", { id: 'messages' }).then(value => value.dataValues);
                    const channel = await client.guilds.cache.get(guild?.value).channels.cache.get(messages.value);
                    
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


        // // Internal ticks
        // Discord presence
        setInterval(() => {
            
            client.user.setActivity('your concerns.', { type: 'LISTENING', status: 'online'});

        } , 12000000);

        // Reminders
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
                            const channel = await client.guilds.cache.get(guild?.value).channels.cache.get(messages.value);
                            
                            channel.messages.fetch(value.id).then((target) => {
                                target.delete();
                            }).catch(() => {
                                console.log('Could not delete a reminder message.');
                            });
                        }
        
                    });
        
        }, 15000);

        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);

        deploy();
    })
}
