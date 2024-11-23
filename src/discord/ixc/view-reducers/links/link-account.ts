import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {BackB, NextB, SingleS, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {ApiTokenT, LINK_ACCOUNT_MODAL_SUBMIT, LINK_ACCOUNT_MODAL_OPEN, PlayerTagT} from '#src/discord/ixc/modals/link-account-modal.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/board-info.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {oneofus} from '#src/discord/ixs/link/oneofus.ts';


const axn = {
    LINK_ACCOUNT_TYPE_OPEN  : makeId(RDXK.OPEN, 'SPTO'),
    LINK_ACCOUNT_TYPE_UPDATE: makeId(RDXK.UPDATE, 'SPTU'),
};


export const LinkAccountB = SuccessB.as(axn.LINK_ACCOUNT_TYPE_OPEN, {
    label: 'Link Account',
});
const TypeS = SingleS.as(axn.LINK_ACCOUNT_TYPE_UPDATE, {
    placeholder: 'Account Type',
    options    : [{
        label: 'NOOP',
        value: 'NOOP',
    }],
});
const TypeToModalB = SuccessB.as(LINK_ACCOUNT_MODAL_OPEN, {
    label: 'Player Tag / API Token',
});


const view1 = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title  : 'Select Account Type',
        sel1   : Type,
        forward: TypeToModalB.withData(Type.values).render({
            disabled: Type.values.length === 0,
        }),
        back: BackB.as(LinkB.id),
    };
}));


const view2 = typeRx((s, ax) => E.gen(function * () {
    const tag = PlayerTagT.fromMap(ax.cmap);
    const api = ApiTokenT.fromMap(ax.cmap);
    const account_kind = ax.id.params.data![0];

    const message = yield * oneofus(s.original, {
        player_tag  : tag?.component.value ?? '',
        api_token   : api?.component.value ?? '',
        account_kind: account_kind,
        discord_user: undefined,
    });

    return {
        ...s,
        title      : 'Account Linked',
        description: message.embeds[0].description,
        next       : NextB.as(LinkB.id),
    };
}));


export const linkAccountReducer = {
    [LinkAccountB.id.predicate]          : view1,
    [TypeS.id.predicate]                 : view1,
    [LINK_ACCOUNT_MODAL_SUBMIT.predicate]: view2,
};
