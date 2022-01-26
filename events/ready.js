export default async (client) => {
    // Client Console Update
    client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
    
    // Client Presence Update
    console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);
}
