import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {makeButton} from '#src/discord/ixc/old/make/components.ts';
import {IXCBS} from '#src/discord/util/discord.ts';


export const IXCNoop = () => E.succeed(null);


export const GlobalCloseB = makeButton('CL', {
    label: 'Close',
    style: IXCBS.SECONDARY,
});

export const GlobalCloseBB = GlobalCloseB
    .bind((ix) => pipe(
        DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token),
        E.as(null),
    ));
