import glob from 'glob';
import { promisify } from 'util';

const globPromise = promisify(glob);

export default async () => {
    //console.log(client);
    const eventFiles = await globPromise(`events/*.mjs`);
    //import().then(async ready => { ready.default(client) }).catch(e => console.log(e));

    eventFiles.map((value) => import(`../${value}`).then(async ready => { ready.default() }).catch(e => console.log(e)));
    
    console.log(eventFiles);
}