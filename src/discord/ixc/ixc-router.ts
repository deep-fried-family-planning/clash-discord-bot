import {CSL, E} from '#src/internal/pure/effect.ts';
import type {IxDc} from '#src/discord/util/discord.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {deriveAction} from '#src/discord/ixc/store/derive-action.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {deriveState, type IxState} from '#src/discord/ixc/store/derive-state.ts';
import {deriveView} from '#src/discord/ixc/store/derive-view.ts';
import {allReducers} from '#src/discord/ixc/view-reducers/all-reducers.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import {UserB, userEditReducer} from '#src/discord/ixc/view-reducers/user-settings.ts';
import {LinkAccountB} from '#src/discord/ixc/view-reducers/links/link-account.ts';


export const ixcRouter = (ix: IxD) => E.gen(function * () {
    const ax = yield * deriveAction(ix, ix.data as IxDc);
    let s: IxState | und;

    if ([RDXK.CLOSE].includes(ax.id.params.kind)) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    if ([RDXK.MODAL_OPEN, RDXK.MODAL_OPEN_FORWARD].includes(ax.id.params.kind)) {
        return;
    }

    if ([RDXK.MODAL_SUBMIT, RDXK.MODAL_SUBMIT_FORWARD].includes(ax.id.params.kind)) {
        const modalState = yield * DynamoDBDocument.get({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
                pk: `t-${ax.id.params.forward!}`,
                sk: `t-${ax.id.params.forward!}`,
            },
            ConsistentRead: true,
        });
        yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, modalState.Item!.token as str);
        yield * DynamoDBDocument.delete({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
                pk: `t-${ax.id.params.forward!}`,
                sk: `t-${ax.id.params.forward!}`,
            },
        });

        const json = JSON.parse(modalState.Item!.bodyJSON as str) as IxD;

        s = yield * deriveState(json, ix.data as IxDc);
    }

    s ??= yield * deriveState(ix, ix.data as IxDc);

    if (!s.user) {
        if (ax.id.predicate in userEditReducer) {
            const next = yield * allReducers[ax.id.predicate](s, ax);
            const message = yield * deriveView(next, ax);

            return yield * DiscordApi.editMenu(ix, message);
        }

        const next = yield * allReducers[UserB.id.predicate](s, {
            ...ax,
            id: UserB.fwd(LinkAccountB.id).id,
        });
        const message = yield * deriveView(next, ax);

        return yield * DiscordApi.entryMenu(ix, message);
    }


    if (ax.id.params.kind === RDXK.MODAL_SUBMIT) {
        yield * CSL.debug(s);
        yield * CSL.debug(ax);

        const next = yield * allReducers[ax.id.predicate](s, ax);
        const message = yield * deriveView(next, ax);

        return yield * DiscordApi.editMenu(ix, message);
    }

    const predicate
        = ax.id.params.kind === RDXK.BACK ? ax.id.backPredicate
        : ax.id.params.kind === RDXK.FORWARD ? ax.id.nextPredicate
        : ax.id.params.kind === RDXK.MODAL_SUBMIT_FORWARD ? ax.id.nextPredicate
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
