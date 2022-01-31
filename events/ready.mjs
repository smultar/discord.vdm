import client from "../index.mjs";

export default async () => {

    client.once("ready", () => {


        // Sync Reminders

        // Sync Messages

        // Sync Webhooks

        // Client Console Update
        client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
        
        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);
    })
}
