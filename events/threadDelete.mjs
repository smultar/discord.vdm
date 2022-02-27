import { WebhookClient } from 'discord.js';
import client from '../index.mjs';
import { write, read, fetchAll } from '../database/index.js';

export default async () => {

    client.on('threadDelete', async (thread) => {
        console.log('Deleted Thread:', thread);

    });
 
}