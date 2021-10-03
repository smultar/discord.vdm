module.exports = (client) => {
    // Client Console Update
    console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);

    // Client Presence Update
    client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
};