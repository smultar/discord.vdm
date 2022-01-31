import client from "../index.mjs";

export default async () => {

    console.log('triggered ready')

    client.once("ready", () => {
        console.log(client)

        // Client Console Update
        client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
        
        // Mozu Ready

        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);
    })
}
