import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {InfoB} from '#src/discord/ixc/view-reducers/board-info.ts';
import {queryDiscordClanForServer} from '#src/dynamo/discord-clan.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {ClanViewerAdminB} from '#src/discord/ixc/view-reducers/clan-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';


const getClans = typeRxHelper((s, ax) => E.gen(function * () {
    const records = pipe(
        yield * queryDiscordClanForServer({pk: s.server_id}),
        sortWithL((r) => r.sk, ORDS),
    );

    const clans = pipe(
        yield * Clashofclans.getClans(records.map((r) => r.sk)),
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
}));


export const ClanViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'VC'), {
    label: 'Clans',
});

export const ClanViewerSelector = SingleS.as(makeId(RDXK.UPDATE, 'VC'), {
    placeholder: 'Select Clan',
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        row1: [


            ClanViewerAdminB.if(s.user_roles.includes(s.server!.admin as snflk)),
        ],
        back: BackB.as(InfoB.id),
    };
}));


export const clanViewerReducer = {
    [ClanViewerB.id.predicate]       : view,
    [ClanViewerSelector.id.predicate]: view,
};
