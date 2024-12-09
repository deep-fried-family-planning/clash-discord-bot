import hapi from '@hapi/hapi';
import {delay} from 'effect/Effect';
import {CFG, E, L, pipe, RDT} from '#src/internal/pure/effect.ts';
import {WebSocket} from 'ws';
import {fromParameterStore} from '@effect-aws/ssm';
import {handler} from '#src/ix_menu.ts';
import Nes from '@hapi/nes';


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

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log('Message received:', data);

    if (data.app_permissions) {
        void handler(data, {}).catch(() => {});
    }
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

socket.send(JSON.stringify({
    action : 'default',
    message: 'Hello everyone',
}));


const server = hapi.server({
    host: 'localhost',
    port: 3000,
});
await server.register(Nes);

server.route({
    method: 'GET',
    path  : '/h',
    config: {
        id     : 'hello',
        handler: (request, h) => {
            return 'world!';
        },
    },
});

await server.start();

console.log('Server running on %s', server.info.uri);
