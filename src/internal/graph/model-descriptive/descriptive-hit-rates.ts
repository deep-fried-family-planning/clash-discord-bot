import type {GraphModel, OptimizedHit} from '#src/internal/graph/pipeline/optimize-types.ts';
import type {IDKV} from '#src/internal/graph/types.ts';
import {filterKV, reduceKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import {tryOrDefault} from '#src/internal/pure/types-pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {pipe} from 'effect/Function';

export const descriptiveHitRates = (cid: string, pids: ClanWarMember[], graph: GraphModel) => {
  const [attacks, defenses] = pipe(
    graph.players,
    filterKV((p) => p.data.cid === cid),
    reduceKV([{}, {}] as [IDKV<OptimizedHit[]>, IDKV<OptimizedHit[]>], ([atks, defs], p) => {
      const attacks = pipe(p.attacks, reduceKV([] as OptimizedHit[], (as, a) => {
        as.push(a);
        return as;
      }));

      atks[p.data.pid] ??= [];
      atks[p.data.pid].push(...attacks);

      const defenses = pipe(p.defenses, reduceKV([] as OptimizedHit[], (ds, d) => {
        ds.push(d);
        return ds;
      }));

      defs[p.data.pid] ??= [];
      defs[p.data.pid].push(...defenses);

      return [atks, defs];
    }),
  );

  return pipe(pids, reduceL([] as [ClanWarMember, [number, number], [number, number]][], (acc, pid) => {
    const [atks, defs] = [attacks[pid.tag], defenses[pid.tag]];

    acc.push([
      pid,
      tryOrDefault(() => [atks.filter((a) => a.data.stars === 3).length / atks.length, atks.length], [0, 0]),
      tryOrDefault(() => [defs.filter((a) => a.data.stars < 3).length / defs.length, defs.length], [0, 0]),
    ]);

    return acc;
  }));
};
