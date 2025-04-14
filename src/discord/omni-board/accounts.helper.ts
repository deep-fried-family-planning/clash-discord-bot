import {Thing } from '#src/discord/omni-board/accounts.tsx';
import {E} from '#src/disreact/utils/re-exports.ts';
import console from 'node:console';

const out = E.runSync(Thing);

console.log(Thing);
console.log(out);
console.log(JSON.stringify(Thing));
console.log(JSON.stringify(out));
