import {E} from '#src/internal/pure/effect.ts';
import {BackB, NewB, PrimaryB, SingleS} from '#src/discord/components/global-components.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {asViewer, unset} from '#src/discord/components/component-utils.ts';
import {LinkB} from '#src/discord/view-reducers/omni-board.ts';
import {AccountViewerAdminB} from '#src/discord/view-reducers/account-viewer-admin.ts';
import {LinkAccountB} from '#src/discord/view-reducers/links/link-account.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {viewUserPlayerOptions} from '#src/discord/components/views/user-player-options.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/constants/route-kind.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {LABEL_ACCOUNTS, LABEL_YOUR_ACCOUNTS} from '#src/internal/constants/label.ts';
import {PLACEHOLDER_SELECT_ACCOUNT} from '#src/internal/constants/placeholder.ts';
import {DESC_NO_ACCOUNT_SELECTED} from '#src/internal/constants/description.ts';


export const AccountViewerB = PrimaryB.as(makeId(RK_OPEN, 'AV'), {
    label: LABEL_ACCOUNTS,
});
export const AccountViewerAccountS = SingleS.as(makeId(RK_UPDATE, 'AVA'), {
    placeholder: PLACEHOLDER_SELECT_ACCOUNT,
});


export const getPlayers = (s: St) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: s.user_id});

    const players = yield * Clashofclans.getPlayers(records.map((r) => r.sk));

    return viewUserPlayerOptions(records, players);
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Account = AccountViewerAccountS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (AccountViewerB.clicked(ax)) {
        Account = AccountViewerAccountS.render({
            options: yield * getPlayers(s),
        });
    }

    return {
        ...s,
        title      : LABEL_YOUR_ACCOUNTS,
        description: undefined,

        viewer: asViewer(
            s.editor
            ?? s.viewer
            ?? Account.values[0]
                ? {
                    title: Account.values[0],
                }
                : {
                    description: DESC_NO_ACCOUNT_SELECTED,
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
    } satisfies St;
});


export const accountViewerReducer = {
    [AccountViewerB.id.predicate]       : view,
    [AccountViewerAccountS.id.predicate]: view,
};
