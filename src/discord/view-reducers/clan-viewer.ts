import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {RK_OPEN, RK_UPDATE} from '#src/constants/route-kind.ts';
import {asViewer, unset} from '#src/discord/components/component-utils.ts';
import {BackB, PrimaryB, SingleS} from '#src/discord/components/global-components.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import type {snflk} from '#src/discord/types.ts';
import {ClanViewerAdminB} from '#src/discord/view-reducers/clan-viewer-admin.ts';
import {LinkClanB} from '#src/discord/view-reducers/links/link-clan.ts';
import {OmbiBoardB} from '#src/discord/view-reducers/omni-board.ts';
import {queryDiscordClanForServer} from '#src/dynamo/schema/discord-clan.ts';
import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import type {Embed} from 'dfx/types';


const getClans = (s: St, ax: Ax) => E.gen(function * () {
    const records = pipe(
        yield * queryDiscordClanForServer({pk: s.server_id}),
        sortWithL((r) => r.sk, ORDS),
    );

    const clans = pipe(
        yield * ClashOfClans.getClans(records.map((r) => r.sk)),
        sortWithL((c) => c.tag, ORDS),
    );

    return pipe(
        zipL(records, clans),
        sortByL(
            ORD.mapInput(ORDNR, ([r, c]) => c.level),
            ORD.mapInput(ORDS, ([r, c]) => c.name),
            ORD.mapInput(ORDS, ([r, c]) => r.sk),
        ),
        mapL(([r, c]) => ({
            label      : `[lvl${c.level}]  ${c.name}`,
            description: `tag: ${c.tag}, verification_level: ${r.verification}`,
            value      : c.tag,
        })),
    );
});


export const ClanViewerB = PrimaryB.as(makeId(RK_OPEN, 'CV'), {
    label: 'Clans',
});
export const ClanViewerSelector = SingleS.as(makeId(RK_UPDATE, 'CV'), {
    placeholder: 'Select Clan',
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);
    let Clan = ClanViewerSelector.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    let viewer: Embed | undefined = undefined;


    if (ax.id.predicate === ClanViewerB.id.predicate) {
        Clan = ClanViewerSelector.render({
            options: yield * getClans(s, ax),
        });

        viewer = {
            description: 'No Clan Selected',
        };
    }


    return {
        ...s,
        title      : 'Clan',
        description: unset,

        viewer: asViewer(
            s.editor
            ?? viewer
            ?? s.viewer,
        ),
        editor: unset,
        status: unset,

        sel1: Clan,

        back: BackB.as(OmbiBoardB.id),
        submit:
            !Clan.values.length
                ? LinkClanB.if(s.user_roles.includes(s.server!.admin as snflk))
                : ClanViewerAdminB.if(s.user_roles.includes(s.server!.admin as snflk)),
    } satisfies St;
});


export const clanViewerReducer = {
    [ClanViewerB.id.predicate]       : view,
    [ClanViewerSelector.id.predicate]: view,
};
