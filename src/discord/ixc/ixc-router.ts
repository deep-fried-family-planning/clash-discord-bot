import {E} from '#src/internal/pure/effect.ts';
import type {IxDc} from '#src/discord/util/discord.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {deriveAction} from '#src/discord/ixc/store/derive-action.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {deriveState} from '#src/discord/ixc/store/derive-state.ts';
import {deriveView} from '#src/discord/ixc/store/derive-view.ts';
import {reducerFirst} from '#src/discord/ixc/reducers/reducer-first.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {allReducers} from '#src/discord/ixc/reducers/all-reducers.ts';


export const ixcRouter = (ix: IxD) => E.gen(function * () {
    const ax = yield * deriveAction(ix, ix.data as IxDc);

    if (ax.id.params.kind === RDXK.CLOSE || ax.id.params.kind === RDXK.MODAL_OPEN) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    const s = yield * deriveState(ix, ix.data as IxDc);

    if (!s.user || (ax.id.predicate in reducerFirst)) {
        const next = !(ax.id.predicate in reducerFirst)
            ? yield * reducerFirst[AXN.FU_OPEN.predicate](s, ax)
            : yield * reducerFirst[ax.id.predicate](s, ax);

        const message = yield * deriveView(next, ax);

        if (ax.id.params.kind === RDXK.ENTRY) {
            return yield * DiscordApi.entryMenu(ix, message);
        }
        return yield * DiscordApi.editMenu(ix, message);
    }

    if (ax.id.params.kind === RDXK.MODAL_SUBMIT) {
        const next = yield * allReducers[ax.id.predicate](s, ax);
        const message = yield * deriveView(next, ax);

        return yield * DiscordApi.editMenu(ix, message);
    }

    const predicate
        = ax.id.params.kind === RDXK.BACK ? ax.id.backPredicate
        : ax.id.params.kind === RDXK.FORWARD ? ax.id.backPredicate
        : ax.id.predicate;

    if (!(predicate in allReducers)) {
        return yield * new SlashUserError({issue: 'Unknown Interaction'});
    }

    const next = yield * allReducers[predicate](s, ax);
    const message = yield * deriveView(next, ax);

    if (ax.id.params.kind === RDXK.ENTRY) {
        return yield * DiscordApi.entryMenu(ix, message);
    }

    return yield * DiscordApi.editMenu(ix, message);
});
