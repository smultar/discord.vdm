import client from "../index.mjs";

export default async () => {

    client.on('interactionCreate', async (interaction) => {
        const command = client.commands.get(interaction.commandName);
        
        if (!command) return console.log('Command not found:', (!command), interaction.commandName);

        try { 

            await command.default(interaction, client);

        } catch (e) {
            console.log(e);
        }

    });
}
