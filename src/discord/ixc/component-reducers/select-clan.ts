import {typeRx, typeRxHelper, makeId} from '#src/discord/ixc/reducers/type-rx.ts';
import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {queryDiscordClanForServer} from '#src/dynamo/discord-clan.ts';
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
    SELECT_CLAN_OPEN   : makeId(RDXK.INIT, 'CLAN'),
    SELECT_CLAN_UPDATE : makeId(RDXK.UPDATE, 'CLAN'),
    SELECT_CLAN_FORWARD: makeId(RDXK.FORWARD, 'CLAN'),
};


export const ClanB = PrimaryB.as(axn.SELECT_CLAN_OPEN, {label: 'Select Clan'});
const ClanS = SingleS.as(axn.SELECT_CLAN_UPDATE, {placeholder: 'Select Clan'});
const ClanFB = ForwardB.as(axn.SELECT_CLAN_FORWARD);


const view = typeRx((s, ax) => E.gen(function * () {
    const initSelector
        = ClanS.fromMap(s.cmap)
        ?? ClanS.with({options: yield * getClans(s, ax)});

    const Selector = ax.id.predicate === initSelector.id.predicate
        ? initSelector.setDefaultValues(ax.selected.map((s) => s.value))
        : initSelector;

    const Forward
        = ClanFB.fromMap(s.cmap)
        ?? ClanFB.forward(ax.id);

    return {
        ...s,
        title  : 'Select Clan',
        sel1   : Selector,
        forward: Forward.with({
            disabled: Selector.values.length === 0,
        }),
    };
}));


export const selectClanReducer = {
    [ClanB.id.predicate] : view,
    [ClanS.id.predicate] : view,
    [ClanFB.id.predicate]: view,
};

