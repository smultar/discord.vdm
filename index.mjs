import Discord, { Client, Collection, Intents } from 'discord.js';
import fs from 'fs'; import sequelize from 'sequelize';
import settings from './settings.json';

// Instantiate client
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});

// Client Objects
client.commands = new Collection();
client.messages = new Collection();
client.history = new Collection();
client.reminders = new Collection(); 
client.blocked = new Collection(); 

export default client;

import handler from './handlers/event.mjs'; handler();
import interactions from './handlers/interaction.mjs'; interactions();

client.login(settings.token);
