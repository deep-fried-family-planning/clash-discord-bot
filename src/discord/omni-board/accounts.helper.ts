import {thing} from '#src/discord/omni-board/accounts.tsx';
import {E} from '#src/disreact/utils/re-exports.ts';
import console from 'node:console';

const out = E.runSync(thing);

console.log(thing);
console.log(out);
console.log(JSON.stringify(thing));
console.log(JSON.stringify(out));
