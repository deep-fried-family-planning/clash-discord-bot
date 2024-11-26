import {makeId} from '#src/discord/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {BackB, ForwardB, SingleS, SuccessB} from '#src/discord/components/global-components.ts';
import {ApiTokenT, LINK_ACCOUNT_MODAL_SUBMIT, LINK_ACCOUNT_MODAL_OPEN, PlayerTagT} from '#src/discord/modals/link-account-modal.ts';
import {LinkB} from '#src/discord/view-reducers/omni-board.ts';
import {oneofus} from '#src/discord/commands/link/oneofus.ts';
import {SELECT_ACCOUNT_TYPE} from '#src/discord/ix-constants.ts';
import {asFailure, asSuccess, unset} from '#src/discord/components/component-utils.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {LABEL_ACCOUNT_LINK, LABEL_ACCOUNT_TYPE, LABEL_LINK, LABEL_PLAYER_TAG_API_TOKEN, LABEL_TRY_AGAIN} from '#src/internal/constants/label.ts';


export const LinkAccountB = SuccessB.as(makeId(RK_OPEN, 'SPTO'), {
    label: LABEL_LINK,
});
const TypeS = SingleS.as(makeId(RK_UPDATE, 'SPTU'), {
    placeholder: LABEL_ACCOUNT_TYPE,
    options    : SELECT_ACCOUNT_TYPE,
});
const TypeToModalB = SuccessB.as(LINK_ACCOUNT_MODAL_OPEN, {
    label: LABEL_PLAYER_TAG_API_TOKEN,
});


const view1 = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title      : LABEL_ACCOUNT_LINK,
        description: unset,

        viewer: unset,
        editor: unset,
        status: unset,

        sel1  : Type,
        back  : BackB.as(LinkB.id),
        submit: TypeToModalB.withData(Type.values).render({
            disabled: Type.values.length === 0,
        }),
    } satisfies St;
});


const view2 = (s: St, ax: Ax) => E.gen(function * () {
    const tag = PlayerTagT.fromMap(ax.cmap);
    const api = ApiTokenT.fromMap(ax.cmap);
    const account_kind = ax.id.params.data![0];

    const message = yield * oneofus(s.original, {
        player_tag  : tag?.component.value ?? '',
        api_token   : api?.component.value ?? '',
        account_kind: account_kind,
        discord_user: undefined,
    }).pipe(
        E.catchTag('DeepFryerSlashUserError', (e) => E.succeed({
            type  : 'ReturnableError',
            embeds: [{
                description: e.issue,
            }],
        })),
        E.catchTag('DeepFryerClashError', (e) => E.succeed({
            type  : 'ReturnableError',
            embeds: [{
                // @ts-expect-error clashperk lib types
                description: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
            }],
        })),
    );

    return {
        ...s,
        title      : LABEL_ACCOUNT_LINK,
        description: unset,

        viewer: unset,
        editor: unset,
        status: 'type' in message
            ? asFailure(message.embeds[0])
            : asSuccess(message.embeds[0]),

        back: BackB.as(LinkAccountB.id).render({
            label: 'type' in message
                ? LABEL_TRY_AGAIN
                : LABEL_LINK,
        }),
        forward: ForwardB.as(LinkB.id),
    } satisfies St;
});


export const linkAccountReducer = {
    [LinkAccountB.id.predicate]          : view1,
    [TypeS.id.predicate]                 : view1,
    [LINK_ACCOUNT_MODAL_SUBMIT.predicate]: view2,
};
