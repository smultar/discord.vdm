import Discord, { Client, Collection, Intents } from 'discord.js';
import fs from 'fs'; import sequelize from 'sequelize';
import settings from './Settings.json';


// Instantiate client
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});

// Client Objects
client.discord = Discord;
client.commands = new Collection();
client.activeSessions = [];

export default client;

import handler from './handlers/event.mjs'; handler(client);
//import ('./handlers/event.mjs').then(async handler => { console.log(handler); await handler(client) }).catch(e => console.log(e));



client.login(settings.token);

client.on('ready', () => {
    console.log('test')
})