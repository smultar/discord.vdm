import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { promisify } from 'util';

import glob from 'glob';
import client from './index.mjs';


const globPromise = promisify(glob);

export default async () => {
    try {

        const rest = new REST({ version: '9'}).setToken(client.token); 
        const commandJSON = []; 
        
        client.commands.forEach(async (interaction) => {
            commandJSON.push(interaction.command.toJSON());
        });

        console.log(`Attempting to sync '${commandJSON.length}' commands across '${client.guilds.cache.size}' discord servers.`);
        
        // Sync commands, across, all discord servers.
        await client.guilds.cache.forEach(async (guild, index) => {

            await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commandJSON })
                .then(() => console.log(`Commands synced with '${guild.name}'`))
                .catch(e => console.log(e));
        });

    } catch (e) {
        console.log('Failed to sync commands', e);
    }

};

