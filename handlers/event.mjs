import glob from 'glob';
import { promisify } from 'util';

const globPromise = promisify(glob);

export default async () => {
    const eventFiles = await globPromise(`events/*.mjs`);

    eventFiles.map((value) => import(`../${value}`).then(async ready => { ready.default() }).catch(e => console.log(e)));
    
    console.log(eventFiles);
}