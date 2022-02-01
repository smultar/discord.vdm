import client from "../index.mjs";
import { write, settingsDef} from "../database.js";

export default async () => {

    client.once("ready", async () => {


        // Sync Reminders

        // Sync Messages

        // Sync Webhooks

        // Client Console Update
        client.user.setActivity('Bizu Scream', { type: 'LISTENING', status: 'online'});
        
        // Client Presence Update
        console.log(`Connection System: ${client.user.tag} is connected to Discord's servers.`);

        settingsDef.sync();

        setTimeout(async () => {
            console.log("Database System: Database has been synced.");

            // Tmp Actions
            let messages = await write("set", {
                name: 'messages',
                value: '935963236216504400'
            });
    
            let reminders = await write("set", {
                name: 'reminders',
                value: '935964011831365663'
            })
    
            let category = await write("set", {
                name: 'category',
                value: '888299808937373706'
            })
            console.log(messages);
            console.log(reminders);
            console.log(category);
        }, 5000);


    })
}
