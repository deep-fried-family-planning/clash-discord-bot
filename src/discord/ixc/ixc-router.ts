import {CSL, E} from '#src/internal/pure/effect.ts';
import type {IxDc} from '#src/discord/util/discord.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {DeepFryerUnknownError, SlashUserError} from '#src/internal/errors.ts';
import {deriveAction} from '#src/discord/ixc/store/derive-action.ts';
import {IXCD_ACTIONS} from '#src/discord/ixc/reducers/actions.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {deriveState} from '#src/discord/ixc/store/derive-state.ts';
import {deriveView} from '#src/discord/ixc/store/derive-view.ts';
import {firstReducer} from '#src/discord/ixc/reducers/first.ts';
import {AXN_FIRST} from '#src/discord/ixc/reducers/ax.ts';


export const ixcRouter = (ix: IxD) => E.gen(function * () {
    if (!ix.data) {
        return yield * new DeepFryerUnknownError({issue: 'Routing Error'});
    }

    const action = yield * deriveAction(ix, ix.data as IxDc);

    if (action.id.params.kind === RDXK.CLOSE) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    const state = yield * deriveState(ix, ix.data as IxDc);

    if (!state.user || (action.predicate in firstReducer)) {
        const next = !(action.predicate in firstReducer)
            ? yield * firstReducer[AXN_FIRST.FIRST_USER.predicate](state, action)
            : yield * firstReducer[action.predicate](state, action);

        const message = yield * deriveView(next);

        if (action.id.params.kind === RDXK.ENTRY) {
            yield * CSL.debug('[ENTRY]');
            return yield * DiscordApi.entryMenu(ix, message);
        }

        yield * CSL.debug('[EDIT]');
        return yield * DiscordApi.editMenu(ix, message);
    }

    if (!(action.predicate in IXCD_ACTIONS)) {
        return yield * new SlashUserError({issue: 'Unknown Interaction'});
    }

    const next = yield * IXCD_ACTIONS[action.predicate](state, action);

    const message = yield * deriveView(next);

    if (action.id.params.kind === RDXK.ENTRY) {
        yield * CSL.debug('[ENTRY]');
        return yield * DiscordApi.entryMenu(ix, message);
    }

    yield * CSL.debug('[EDIT]');
    return yield * DiscordApi.editMenu(ix, message);
});
