import glob from 'glob';
import { promisify } from 'util';
import client from '../index.mjs';

const globPromise = promisify(glob);

export default async () => {
    const eventFiles = await globPromise(`interactions/*.mjs`);

    eventFiles.map((value) => import(`../${value}`).then(async interaction => { 
        client.commands.set(interaction.name, interaction);
    }).catch(e => console.log(e)));
}