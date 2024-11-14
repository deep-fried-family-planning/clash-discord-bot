import {UI} from 'dfx';
import {ButtonStyle} from 'dfx/types';
import {E} from '#src/internal/pure/effect.ts';
import {makeMenu} from '#src/discord/ixc/ixc-make.ts';

export const LinkAccountStart = makeMenu('LinkAccountStart', UI.button, {
    label: 'Link',
    style: ButtonStyle.SUCCESS,
},
(ix, data) => E.gen(function * () {
    return {
        embeds: [{
            description: JSON.stringify(data, null, 2),
        }],
        components: UI.grid([
            [ModalLinkAccount.built, LinkAccountHelp.built],
        ]),
    };
}));

export const ModalLinkAccount = makeMenu('ModalLinkAccount', UI.button, {
    label: 'Open',
    style: ButtonStyle.SUCCESS,
},
() => E.gen(function * () {
    return undefined;
}));

export const LinkAccountHelp = makeMenu('LinkAccountHelp', UI.button, {
    label: 'Help',
    style: ButtonStyle.SECONDARY,
},
() => E.gen(function * () {
    return undefined;
}));
