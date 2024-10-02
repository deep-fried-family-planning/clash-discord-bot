import type {GraphModel, OptimizedHit} from '#src/data/pipeline/optimize-types.ts';
import type {IDKV} from '#src/data/types.ts';
import {tryOrDefault} from '#src/pure/types-pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {filterKV, reduceKV} from '#src/pure/pure-kv.ts';
import {pipe} from '#src/utils/effect.ts';
import {reduceL} from '#src/pure/pure-list.ts';

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
