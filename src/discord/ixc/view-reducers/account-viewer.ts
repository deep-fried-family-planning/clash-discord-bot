import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect';
import {BackB, NewB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {AccountViewerAdminB} from '#src/discord/ixc/view-reducers/account-viewer-admin.ts';
import {LinkAccountB} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import {viewUserPlayerOptions} from '#src/discord/ixc/views/user-player-options.ts';


export const AccountViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'AV'), {
    label: 'Accounts',
});
export const AccountViewerAccountS = SingleS.as(makeId(RDXK.UPDATE, 'AVA'), {
    placeholder: 'Select Account',
});


export const getPlayers = (s: IxState) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: s.user_id});

    const players = yield * Clashofclans.getPlayers(records.map((r) => r.sk));

    return viewUserPlayerOptions(records, players);
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Account = AccountViewerAccountS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (AccountViewerB.clicked(ax)) {
        Account = AccountViewerAccountS.render({
            options: yield * getPlayers(s),
        });
    }

    return {
        ...s,
        title      : 'Your Accounts',
        description: undefined,

        viewer: asViewer(
            s.editor
            ?? s.viewer
            ?? Account.values[0]
                ? {
                    title: Account.values[0],
                }
                : {
                    description: 'No Account Selected',
                },
        ),
        editor: undefined,
        status: undefined,

        sel1: Account.render({disabled: false}),

        back: BackB.as(LinkB.id),


        submit:
            !Account.values.length
                ? LinkAccountB.render({
                    label: unset!,
                    emoji: NewB.component.emoji!,
                })
                : AccountViewerAdminB,
    };
}));


export const accountViewerReducer = {
    [AccountViewerB.id.predicate]       : view,
    [AccountViewerAccountS.id.predicate]: view,
    [AccountViewerAccountS.id.predicate]: view,
};
