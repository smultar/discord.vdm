import client from "../index.mjs";
import { WebhookClient } from 'discord.js';
import { write, read, fetchAll } from "../database/index.js";

export default async () => {

    client.on('interactionCreate', async (interaction) => { console.log(interaction)
        const command = client.commands.get(interaction.commandName);
        
        if (!command) return;

        try { 

            await command.default(interaction, client);

        } catch (e) {
            console.log(e);
        }

    });
}
