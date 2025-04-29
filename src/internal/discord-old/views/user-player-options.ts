import type {UserPlayer} from '#src/database/arch/codec.ts';
import {ORD, ORDNR, ORDS, pipe} from '#src/internal/pure/effect.ts';
import {mapL, sortByL, sortWithL, zipL} from '#src/internal/pure/pure-list.ts';
import type {Player} from 'clashofclans.js';

export const viewUserPlayerOptions = (records: UserPlayer[], players: Player[]) => pipe(
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
