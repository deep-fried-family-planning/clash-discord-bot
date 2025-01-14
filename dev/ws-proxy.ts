import {CFG, E, L, pipe, RDT} from '#src/internal/pure/effect.ts';
import {fromParameterStore} from '@effect-aws/ssm';
import hapi from '@hapi/hapi';
import Nes from '@hapi/nes';
import {delay} from 'effect/Effect';
import console from 'node:console';
import {WebSocket} from 'ws';


const wss = await pipe(
    CFG.redacted('/dffp/qual/dev_ws'),
    E.provide(L.setConfigProvider(fromParameterStore())),
    E.runPromise,
);


const socket = new WebSocket(RDT.value(wss));


process.on('unhandledRejection', (err) => {
    console.log(err);
    socket.close();
    process.exit(1);
});

socket.onopen = () => {
    console.log('WebSocket connected');
};
socket.onclose = () => {
    console.log('WebSocket closed', socket);
};


while (!socket.readyState) {
    console.log('readyState', socket.readyState);
    await E.runPromise(pipe(
        E.succeed(''),
        delay('3 second'),
    ));
}
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};


const server = hapi.server({
    host: 'localhost',
    port: 3000,
});

await server.register(Nes);

server.subscription('/dev');

await server.start();

socket.onmessage = (event) => {
    // console.log('Received message', JSON.parse(event.data as str));
  console.log(new Date(Date.now()).toISOString());
    server.publish('/dev', event.data);
};

console.log('Server running on %s', server.info.uri);
