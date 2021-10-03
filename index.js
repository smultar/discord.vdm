const FileSystem = require('fs');
const Settings = require('./settings.json');
const { Client, Intents } = require('discord.js');
const Sequelize = require('sequelize')

// Instantiate client
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'] 
});
client.configuration = Settings;

client.activeSessions = [];

// Modular Events
FileSystem.readdir(`${process.cwd()}/events`, (error, files) => {
    if (error) {
        // do error stuff
    } else {
        files.forEach(file => {
            if (!file.endsWith('.js')) return;

                const event = require(`${process.cwd()}/events/${file}`);
                let eventName = file.split('.')[0];

            if (eventName === 'ready') client.once(eventName, event.bind(null, client));
            
            else client.on(eventName, event.bind(null, client));
            
            delete require.cache[require.resolve(`${process.cwd()}/events/${file}`)];

        });

    }
});

// Database
/*
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'mozu.sqlite',
});
*/


/*
// Modular Utilities
client.utilities = {};
FileSystem.readdir(`${process.cwd()}/handlers/nexus/discord/utilities`, (error, files) => {
    if (error) {
        // do error stuff
    } else {
        files.forEach(file => {
            if (!file.endsWith('.js')) return;

            const utility = require(`${process.cwd()}/handlers/nexus/discord/utilities/${file}`);

            let utilityName = file.split('.')[0];

            client.utilities[utilityName] = utility;

            delete require.cache[require.resolve(`${process.cwd()}/handlers/nexus/discord/utilities/${file}`)];

        });

    }
});

*/

// Client state 
client.state = 'active';

client.login(Settings.Token);