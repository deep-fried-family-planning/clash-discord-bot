import {typeRx, typeRxHelper, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {queryDiscordClanForServer} from '#src/dynamo/schema/discord-clan.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';


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


const axn = {
    SELECT_CLAN_OPEN  : makeId(RDXK.OPEN, 'CLAN'),
    SELECT_CLAN_UPDATE: makeId(RDXK.UPDATE, 'CLAN'),
};


export const ClanSelectB = PrimaryB.as(axn.SELECT_CLAN_OPEN, {label: 'Select Clan'});
const ClanS = SingleS.as(axn.SELECT_CLAN_UPDATE, {placeholder: 'Select Clan'});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Clan = ClanS.fromMap(s.cmap);

    if (axn.SELECT_CLAN_OPEN.predicate === ax.id.predicate) {
        Clan = Clan.render({
            options: yield * getClans(s, ax),
        });
    }

    Clan = Clan.setDefaultValuesIf(ax.id.predicate, selected);

    const Forward
        = ForwardB.fromMap(s.cmap)
        ?? ForwardB.forward(ax.id);

    return {
        ...s,
        title  : 'Select Clan',
        sel1   : Clan,
        forward: Forward
            .addForward(Clan.values[0])
            .render({
                disabled: Clan.values.length === 0,
            }),
    };
}));


export const clanSelectReducer = {
    [ClanSelectB.id.predicate]: view,
    [ClanS.id.predicate]      : view,
};


