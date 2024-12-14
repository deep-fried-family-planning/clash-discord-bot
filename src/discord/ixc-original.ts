import type {IxD, IxDc} from '#src/internal/discord.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import {deriveAction} from '#src/discord/store/derive-action.ts';
import {deriveState, type St} from '#src/discord/store/derive-state.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import {
    RK_BACK,
    RK_CLOSE, RK_FORWARD,
    RK_MODAL_OPEN,
    RK_MODAL_OPEN_FORWARD,
    RK_MODAL_SUBMIT,
    RK_MODAL_SUBMIT_FORWARD,
} from '#src/constants/route-kind.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {UserB, userEditReducer} from '#src/discord/view-reducers/user-settings.ts';
import {allReducers} from '#src/discord/view-reducers/all-reducers.ts';
import {deriveView} from '#src/discord/store/derive-view.ts';
import {LinkAccountB} from '#src/discord/view-reducers/links/link-account.ts';
import {SlashUserError} from '#src/internal/errors.ts';


export const original = (ix: IxD) => E.gen(function * () {
    const ax = deriveAction(ix, ix.data as IxDc);

    let s: St | und;

    if ([RK_CLOSE].includes(ax.id.params.kind)) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    if ([RK_MODAL_OPEN, RK_MODAL_OPEN_FORWARD].includes(ax.id.params.kind)) {
        return;
    }

    if ([RK_MODAL_SUBMIT, RK_MODAL_SUBMIT_FORWARD].includes(ax.id.params.kind)) {
        const modalState = yield * DynamoDBDocument.get({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
                pk: `t-${ax.id.params.forward!}`,
                sk: `t-${ax.id.params.forward!}`,
            },
            ConsistentRead: true,
        });
        // yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, modalState.Item!.token as str);
        yield * DynamoDBDocument.delete({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
                pk: `t-${ax.id.params.forward!}`,
                sk: `t-${ax.id.params.forward!}`,
            },
        });

        const json = JSON.parse(modalState.Item!.bodyJSON as str) as IxD;

        s = yield * deriveState(json, ax);
    }

    s ??= yield * deriveState(ix, ax);

    if (!s.user) {
        if (ax.id.predicate in userEditReducer) {
            const next = yield * allReducers[ax.id.predicate](s, ax);
            const message = deriveView(next);

            return yield * DiscordApi.editMenu(ix, message);
        }

        const next = yield * allReducers[UserB.id.predicate](s, {
            ...ax,
            id: UserB.fwd(LinkAccountB.id).id,
        });
        const message = deriveView(next);

        return yield * DiscordApi.editMenu(ix, message);
    }


    if (ax.id.params.kind === RK_MODAL_SUBMIT) {
        yield * CSL.debug(s);
        yield * CSL.debug(ax);

        const next = yield * allReducers[ax.id.predicate](s, ax);
        const message = deriveView(next);

        return yield * DiscordApi.editMenu(ix, message);
    }

    const predicate
        = ax.id.params.kind === RK_BACK ? ax.id.backPredicate
        : ax.id.params.kind === RK_FORWARD ? ax.id.nextPredicate
        : ax.id.params.kind === RK_MODAL_SUBMIT_FORWARD ? ax.id.nextPredicate
        : ax.id.predicate;

    if (!(predicate in allReducers)) {
        return yield * new SlashUserError({issue: 'Unknown Interaction'});
    }

    const next = yield * allReducers[predicate](s, ax);
    const message = deriveView(next);

    return yield * DiscordApi.editMenu(ix, message);
});
