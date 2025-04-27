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
