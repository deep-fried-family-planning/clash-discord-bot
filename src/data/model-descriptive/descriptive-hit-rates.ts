import type {OptimizedHit, GraphModel} from '#src/data/pipeline/optimize-types.ts';
import {pipe} from 'fp-ts/function';
import {reduce} from 'fp-ts/Array';
import {filter as filterRecords, reduce as reduceRecords} from 'fp-ts/Record';
import {Ord} from 'fp-ts/string';
import type {IDKV} from '#src/data/types.ts';
import {tryOrDefault} from '#src/data/types-pure.ts';
import type {ClanWarMember} from 'clashofclans.js';

export const descriptiveHitRates = (cid: string, pids: ClanWarMember[], graph: GraphModel) => {
    const [attacks, defenses] = pipe(
        graph.players,
        filterRecords((p) => p.data.cid === cid),
        reduceRecords(Ord)([{}, {}] as [IDKV<OptimizedHit[]>, IDKV<OptimizedHit[]>], ([atks, defs], p) => {
            const attacks = pipe(p.attacks, reduceRecords(Ord)([] as OptimizedHit[], (as, a) => {
                as.push(a);
                return as;
            }));

            atks[p.data.pid] ??= [];
            atks[p.data.pid].push(...attacks);

            const defenses = pipe(p.defenses, reduceRecords(Ord)([] as OptimizedHit[], (ds, d) => {
                ds.push(d);
                return ds;
            }));

            defs[p.data.pid] ??= [];
            defs[p.data.pid].push(...defenses);

            return [atks, defs];
        }),
    );

    return pipe(pids, reduce([] as [ClanWarMember, [number, number], [number, number]][], (acc, pid) => {
        const [atks, defs] = [attacks[pid.tag], defenses[pid.tag]];

        acc.push([
            pid,
            tryOrDefault(() => [atks.filter((a) => a.data.stars === 3).length / atks.length, atks.length], [0, 0]),
            tryOrDefault(() => [defs.filter((a) => a.data.stars < 3).length / defs.length, defs.length], [0, 0]),
        ]);

        return acc;
    }));
};
