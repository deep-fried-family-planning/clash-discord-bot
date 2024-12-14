/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any,@typescript-eslint/use-unknown-in-catch-callback-variable,@typescript-eslint/no-unsafe-member-access */

import Nes from '@hapi/nes';
import {wsBackendModel} from './ws-backend-model.ts';


const client = new Nes.Client('ws://localhost:3000');

await client.connect();

await client.subscribe('/dev', (update) => {
    const event = JSON.parse(update as any);

    // console.debug('Event:', event.kind);
    // console.debug('Data:', event.data);

    void wsBackendModel(event.kind, event.data).catch((err) => {
        console.error(err);
    });
});
