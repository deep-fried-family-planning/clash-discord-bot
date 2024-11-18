import {E} from '#src/internal/pure/effect.ts';
import type {IxDc} from '#src/discord/util/discord.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {DeepFryerUnknownError, SlashUserError} from '#src/internal/errors.ts';
import {deriveAction} from '#src/discord/ixc/store/derive-action.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {deriveState} from '#src/discord/ixc/store/derive-state.ts';
import {deriveView} from '#src/discord/ixc/store/derive-view.ts';
import {reducerFirst} from '#src/discord/ixc/reducers/reducer-first.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {allReducers} from '#src/discord/ixc/reducers/all-reducers.ts';


export const ixcRouter = (ix: IxD) => E.gen(function * () {
    if (!ix.data) {
        return yield * new DeepFryerUnknownError({issue: 'Routing Error'});
    }

    const action = yield * deriveAction(ix, ix.data as IxDc);

    if (action.id.params.kind === RDXK.CLOSE) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    const state = yield * deriveState(ix, ix.data as IxDc);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!state.user || (action.predicate in reducerFirst)) {
        const next = !(action.predicate in reducerFirst)
            ? yield * reducerFirst[AXN.FIRST_USER.predicate](state, action)
            : yield * reducerFirst[action.predicate](state, action);

        const message = yield * deriveView(next);

        if (action.id.params.kind === RDXK.ENTRY) {
            return yield * DiscordApi.entryMenu(ix, message);
        }
        return yield * DiscordApi.editMenu(ix, message);
    }

    if (!(action.predicate in allReducers)) {
        return yield * new SlashUserError({issue: 'Unknown Interaction'});
    }

    const next = yield * allReducers[action.predicate](state, action);
    const message = yield * deriveView(next);

    if (action.id.params.kind === RDXK.ENTRY) {
        return yield * DiscordApi.entryMenu(ix, message);
    }
    return yield * DiscordApi.editMenu(ix, message);
});
