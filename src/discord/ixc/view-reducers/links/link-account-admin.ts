import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {BackB, DangerB, ForwardB, SingleS, SingleUserS, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {PlayerTagT} from '#src/discord/ixc/modals/link-account-modal.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/info-board.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {oneofus} from '#src/discord/ixs/link/oneofus.ts';
import {LINK_ACCOUNT_ADMIN_MODAL_OPEN, LINK_ACCOUNT_ADMIN_MODAL_SUBMIT} from '#src/discord/ixc/modals/link-account-admin-modal.ts';
import {asFailure, asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {SELECT_ACCOUNT_TYPE} from '#src/discord/ix-constants.ts';


export const LinkAccountAdminB = DangerB.as(makeId(RDXK.OPEN, 'LAA'), {
    label: 'Admin',
});
const TypeToModalB = SuccessB.as(LINK_ACCOUNT_ADMIN_MODAL_OPEN, {
    label: 'Player Tag',
});
const TypeS = SingleS.as(makeId(RDXK.UPDATE, 'LAAT'), {
    placeholder: 'Account Type',
    options    : SELECT_ACCOUNT_TYPE,
});
const UserS = SingleUserS.as(makeId(RDXK.UPDATE, 'LAAU'), {
    placeholder: 'Select User',
});


const view1 = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const User = UserS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title      : 'Account Admin Link',
        description: unset,

        viewer: unset,
        editor: unset,
        status: unset,

        sel1: Type,
        sel2: User,

        forward: TypeToModalB.withData(Type.values).render({
            disabled:
                Type.values.length === 0
                || User.values.length === 0,
        }),
        back: BackB.as(LinkB.id),
    };
}));


const view2 = typeRx((s, ax) => E.gen(function * () {
    const tag = PlayerTagT.fromMap(ax.cmap);
    // const account_kind = ax.id.params.data![0];

    const Type = TypeS.fromMap(s.cmap);
    const User = UserS.fromMap(s.cmap);

    const message = yield * oneofus(s.original, {
        player_tag  : tag?.component.value ?? '',
        api_token   : 'admin',
        account_kind: Type.values[0],
        discord_user: User.values[0],
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
        title      : 'Account Admin Link',
        description: unset,

        viewer: unset,
        editor: unset,
        status: 'type' in message
            ? asFailure(message.embeds[0])
            : asSuccess(message.embeds[0]),

        back: BackB.as(LinkAccountAdminB.id).render({
            label: 'Link Again',
        }),
        forward: ForwardB.as(LinkB.id),
    };
}));


export const linkAccountAdminReducer = {
    [LinkAccountAdminB.id.predicate]           : view1,
    [TypeS.id.predicate]                       : view1,
    [UserS.id.predicate]                       : view1,
    [LINK_ACCOUNT_ADMIN_MODAL_SUBMIT.predicate]: view2,
};
