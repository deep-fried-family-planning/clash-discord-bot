import {ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import type {Player} from 'clashofclans.js';
import type {DPlayer} from '#src/dynamo/schema/discord-player.ts';


export const viewUserPlayerOptions = (records: DPlayer[], players: Player[]) => pipe(
    zipL(
        pipe(
            records,
            sortWithL((r) => r.sk, ORDS),
        ),
        pipe(
            players,
            sortWithL((p) => p.tag, ORDS),
        ),
    ),
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
