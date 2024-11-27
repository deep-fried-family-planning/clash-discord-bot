import {E} from '#src/internal/pure/effect.ts';
import {BackB, PrimaryB, SingleS, SingleUserS} from '#src/discord/components/global-components.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {asViewer} from '#src/discord/components/component-utils.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {viewUserPlayerOptions} from '#src/discord/views/user-player-options.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/constants/route-kind.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {PLACEHOLDER_SELECT_ACCOUNT} from '#src/internal/constants/placeholder.ts';
import {DESC_NO_ACCOUNT_SELECTED} from '#src/internal/constants/description.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {BotViewerDevB} from '#src/discord/view-reducers/bot-viewer-dev.ts';
import {ClashCache} from "#src/clash/layers/clash-cash.ts";


export const DirectoryViewerB = PrimaryB.as(makeId(RK_OPEN, 'DV'), {
    label: 'Directory',
});
export const DirectoryViewerAccountS = SingleS.as(makeId(RK_UPDATE, 'DVA'), {
    placeholder: PLACEHOLDER_SELECT_ACCOUNT,
});
export const DirectoryViewerUserS = SingleUserS.as(makeId(RK_UPDATE, 'DVU'), {
    placeholder: PLACEHOLDER_SELECT_ACCOUNT,
});


export const getPlayers = (user: str) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: user});

    const players = yield * ClashCache.getPlayers(records.map((r) => r.sk));

    return viewUserPlayerOptions(records, players);
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const User = DirectoryViewerUserS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    let Account = DirectoryViewerAccountS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (DirectoryViewerUserS.id.predicate === ax.id.predicate) {
        Account = DirectoryViewerAccountS.render({
            options: yield * getPlayers(User.values[0]),
        });
    }

    return {
        ...s,
        title      : 'Link Directory',
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

        sel1: User,
        sel2: Account.render({disabled: false}),

        back: BackB.as(BotViewerDevB.id),
    } satisfies St;
});


export const directoryViewerReducer = {
    [DirectoryViewerB.id.predicate]       : view,
    [DirectoryViewerUserS.id.predicate]   : view,
    [DirectoryViewerAccountS.id.predicate]: view,
};
