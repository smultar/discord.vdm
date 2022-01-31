import client from "../index.mjs";

export default async () => {

    client.once("ready", async () => {
        console.log("Ready!");

        // Client Console Update
        client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
        
        // Check if there are any webhooks in the database

        // Check if there are any new threads

        // Check if there are any new reminders

        // Check if there are any new messages

        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);

    })
}
