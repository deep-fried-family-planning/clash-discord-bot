import {CSL, E} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {IXC_ENTRY, IXC_EPHEMERAL} from '#src/discord/ixc/ixc.ts';
import {DeepFryerUnknownError} from '#src/internal/errors.ts';
import {inspect} from 'node:util';


export const ixcRouter = (ix: IxD) => E.gen(function * () {
    if (!ix.data) {
        return yield * new DeepFryerUnknownError({issue: 'Routing Error'});
    }

    if ('component_type' in ix.data) {
        const data = ix.data;

        const entry = IXC_ENTRY.find((e) => e.predicate(data.custom_id));

        if (entry) {
            const menu = yield * entry.handler(ix, ix.data);

            yield * CSL.debug('returning', inspect(menu, true, null));
            yield * E.logDebug('returning', inspect(menu, true, null));

            if (menu) {
                return yield * DiscordApi.entryMenu(ix, menu);
            }
        }

        const ephemeral = IXC_EPHEMERAL.find((e) => e.predicate(data.custom_id));

        if (ephemeral) {
            const menu = yield * ephemeral.handler(ix, data);

            yield * CSL.debug('returning', inspect(menu, true, null));
            yield * E.logDebug('returning', inspect(menu, true, null));

            if (menu) {
                return yield * DiscordApi.editMenu(ix, menu);
            }
        }
    }
});
