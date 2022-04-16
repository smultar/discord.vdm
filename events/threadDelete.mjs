import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, fetchAll, remove } from '../database/index.js';

export default async () => {

    client.on('threadDelete', async (thread) => {
        //console.log('Deleted Thread:', thread);

        let target = client.messages.find(u => u.thread === thread.id);

        if (target) {

            try {
                await client.users.cache.get(target.id).send('Your conversation has been closed.');
            } catch (error) {
                console.log('Could not send "close" message to user.');
            }

            client.messages.delete(target.id);
            await remove("mes", target.id);

        } else {
            console.log('Could not find thread');
        }

    });
 
}