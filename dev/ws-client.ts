import Nes from '@hapi/nes';
import {handler} from '#src/ix_menu.ts';

const client = new Nes.Client('ws://localhost:3000');

await client.connect();

await client.subscribe('/dev', (update) => {
    const data = JSON.parse(update);

    void handler(data, {}).catch((err) => {
        console.error(err);
    });
});
