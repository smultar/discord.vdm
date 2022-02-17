import client from "../index.mjs";
import { WebhookClient } from 'discord.js';
import { write, read, fetchAll } from "../database/index.js";

export default async () => {

    client.on("interactCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.command);
        if (!command) return;

        try { 

            await command.default(interaction, client);

        } catch (e) {
            console.log(e);
        }

    });
}
