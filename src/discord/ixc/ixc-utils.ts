import {makeMenu} from '#src/discord/ixc/ixc-make.ts';
import {UI} from 'dfx';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';

export const Back = makeMenu('Back', UI.button, {
    label: 'Back',
},
(ix) => DiscordApi.editMenu(ix, ix.message!));


export const Close = makeMenu('Close', UI.button, {
    label: 'Close',
},
(ix) => pipe(
    DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token),
    E.as(undefined),
));
