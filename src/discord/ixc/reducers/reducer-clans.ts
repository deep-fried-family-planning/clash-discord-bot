import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E, ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {BackB, CloseB, NextB} from '#src/discord/ixc/components/global-components.ts';
import {ClanS, ClanSF} from '#src/discord/ixc/components/components.ts';
import {queryDiscordClanForServer} from '#src/dynamo/discord-clan.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';


const openClans = buildReducer((s, ax) => E.gen(function * () {
    const records = pipe(
        yield * queryDiscordClanForServer({pk: s.server_id}),
        sortWithL((r) => r.sk, ORDS),
    );
    const clans = pipe(
        yield * Clashofclans.getClans(records.map((r) => r.sk)),
        sortWithL((c) => c.tag, ORDS),
    );
    const together = zipL(records, clans);


    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'openClans',
            }),
            rows: [
                [ClanSF.as(AXN.CLANS_FILTER, {disabled: true})],
                [ClanS.as(AXN.CLANS_SELECT, {
                    options: pipe(
                        together,
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
                    ),
                })],
            ],
            close  : CloseB,
            back   : BackB.as(AXN.INFO_OPEN),
            forward: NextB.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const selectClan = buildReducer((s, ax) => E.gen(function * () {
    const selected = ax.selected[0].value;

    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'selectClan',
            }),
            selected: jsonEmbed({
                clanTag: selected,
            }),
            rows: [
                [ClanSF.as(AXN.CLANS_FILTER, {disabled: true})],
                [ClanS.setDefaultValues([selected])],
            ],
            close  : CloseB,
            back   : BackB.as(AXN.INFO_OPEN),
            forward: NextB.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


export const reducerClans = {
    [AXN.CLANS_OPEN.predicate]  : openClans,
    [AXN.CLANS_SELECT.predicate]: selectClan,
    [AXN.CLANS_FILTER.predicate]: selectClan,
};
