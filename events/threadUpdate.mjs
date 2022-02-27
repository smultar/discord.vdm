import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, fetchAll } from '../database/index.js';

export default async () => {

    client.on('threadUpdate', async (oldThread, newThread ) => {
        console.log('old:', oldThread);
        console.log('new:', newThread);

    });
 
}