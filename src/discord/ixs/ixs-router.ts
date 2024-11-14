import {CSL, E} from '#src/internal/pure/effect';
import type {IxD, IxDs} from '#src/discord/util/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {IXS_LOOKUP} from '#src/discord/ixs/ixs.ts';
import {nameOptions} from '#src/discord/ixs/ixs-utils.ts';


export const ixsRouter = (ix: IxD) => E.gen(function * () {
    yield * CSL.debug('SlashInput', ix);
    yield * CSL.debug('SlashOptions', (ix.data! as IxDs).options);

    const root = (ix.data as IxDs).name as keyof typeof IXS_LOOKUP;

    const message = yield * IXS_LOOKUP[root](ix as never, nameOptions(ix));

    return yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, message);
});
