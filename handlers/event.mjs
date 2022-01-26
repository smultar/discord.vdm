import glob from 'glob';
import { promisify } from 'util';
import client from '../index.mjs';

const globPromise = promisify(glob);

export default async () => {
    //console.log(client);
    const eventFiles = await globPromise(`./events/*.js`);
    console.log(eventFiles);
    eventFiles.map((value) => import(value));
}