import {UI} from 'dfx';
import {E} from '#src/internal/pure/effect.ts';
import {makeMenu} from '#src/discord/ixc/ixc-make.ts';

export const Refresh = makeMenu('Refresh', UI.button, {
    label: 'Refresh',
},
(ix, data) => E.gen(function * () {
    return undefined;
}));
