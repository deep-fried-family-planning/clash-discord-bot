import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect';
import {BackB, NewB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import {makeId, typeRx, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {AccountViewerAdminB} from '#src/discord/ixc/view-reducers/account-viewer-admin.ts';
import {LinkAccountB} from '#src/discord/ixc/view-reducers/links/link-account.ts';


export const AccountViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'AV'), {
    label: 'Accounts',
});
export const AccountViewerAccountS = SingleS.as(makeId(RDXK.UPDATE, 'AVA'), {
    placeholder: 'Select Account',
});


export const getPlayers = typeRxHelper((s, ax) => E.gen(function * () {
    const records = pipe(
        yield * queryPlayersForUser({pk: s.user_id}),
        sortWithL((r) => r.sk, ORDS),
    );

    const players = pipe(
        yield * Clashofclans.getPlayers(records.map((r) => r.sk)),
        sortWithL((p) => p.tag, ORDS),
    );

    const together = zipL(records, players);

    return pipe(
        together,
        sortByL(
            ORD.mapInput(ORDS, ([r]) => r.account_type === 'main' ? '0' : r.account_type === 'admin-parking' ? 'ZZZ' : r.account_type),
            ORD.mapInput(ORDNR, ([, p]) => p.townHallLevel),
            ORD.mapInput(ORDS, ([, p]) => p.name),
            ORD.mapInput(ORDS, ([r]) => r.sk),
        ),
        mapL(([r, p]) => ({
            label      : `${p.name}  (${p.tag})`,
            description: `[${r.account_type}] [th${p.townHallLevel}]`,
            value      : p.tag,
        })),
    );
}));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Account = AccountViewerAccountS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (AccountViewerB.clicked(ax)) {
        Account = AccountViewerAccountS.render({
            options: yield * getPlayers(s, ax),
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

        back  : BackB.as(LinkB.id),
        submit: LinkAccountB.render({
            label   : unset!,
            emoji   : NewB.component.emoji!,
            disabled: !!Account.values.length,
        }),
        delete: AccountViewerAdminB.render({disabled: !Account.values.length}),
    };
}));


export const accountViewerReducer = {
    [AccountViewerB.id.predicate]       : view,
    [AccountViewerAccountS.id.predicate]: view,
    [AccountViewerAccountS.id.predicate]: view,
};
