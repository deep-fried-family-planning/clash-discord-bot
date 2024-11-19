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

    const s = yield * deriveState(ix, ix.data as IxDc);
    const ax = yield * deriveAction(ix, ix.data as IxDc);

    if (ax.id.params.kind === RDXK.CLOSE || ax.id.params.kind === RDXK.MODAL_OPEN) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    if (ax.id.params.kind === RDXK.MODAL_SUBMIT) {
        const next = yield * allReducers[ax.predicate](s, ax);
        const message = yield * deriveView(next, ax);

        return yield * DiscordApi.editMenu(ix, message);
    }

    if (!s.user || (ax.predicate in reducerFirst)) {
        const next = !(ax.predicate in reducerFirst)
            ? yield * reducerFirst[AXN.FIRST_USER.predicate](s, ax)
            : yield * reducerFirst[ax.predicate](s, ax);

        const message = yield * deriveView(next, ax);

        if (ax.id.params.kind === RDXK.ENTRY) {
            return yield * DiscordApi.entryMenu(ix, message);
        }
        return yield * DiscordApi.editMenu(ix, message);
    }

    if (!(ax.predicate in allReducers)) {
        return yield * new SlashUserError({issue: 'Unknown Interaction'});
    }

    const next = yield * allReducers[ax.predicate](s, ax);
    const message = yield * deriveView(next, ax);

    if (ax.id.params.kind === RDXK.ENTRY) {
        return yield * DiscordApi.entryMenu(ix, message);
    }

    return yield * DiscordApi.editMenu(ix, message);
});
