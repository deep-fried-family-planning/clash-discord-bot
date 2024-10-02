/* eslint-disable @typescript-eslint/no-unused-vars */
import type {CID, PID} from '#src/data/types.ts';
import type {
    GClans, GHits,
    GPlayers, GWars, GraphModel,
    OptimizedClan,
    OptimizedHit,
    OptimizedPlayer, OptimizedWar,
} from '#src/data/pipeline/optimize-types.ts';
import {filterKV, toValuesKV} from '#src/pure/pure-kv.ts';
import {flattenL, mapL} from '#src/pure/pure-list.ts';
import {flow} from '#src/utils/effect.ts';

type GQ<I, O> = (m: I) => O;
type MQ<O> = (model: GraphModel) => O;
type CGQ<C, O> = (criteria: C) => (model: GraphModel) => O;

const toWars: MQ<GWars> = flow((m) => m.wars);
const toClans: MQ<GClans> = flow((m) => m.clans);
const toPlayers: MQ<GPlayers> = flow((m) => m.players);
const toHits: MQ<GHits> = flow((m) => m.hits);

export const queryClan: CGQ<CID, OptimizedClan[]> = (criteria) => flow(toClans, filterKV((c) => c.data.cid === criteria), toValuesKV);

export const queryWarsByClan: CGQ<CID, OptimizedWar[]> = (criteria) => flow(
    queryClan(criteria),
    mapL((c) => c.war),
);

export const queryWarHitsByClan: CGQ<CID, OptimizedHit[][]> = (criteria) => flow(
    queryWarsByClan(criteria),
    mapL((w) => toValuesKV(w.hits)),
);

export const queryAttacksByClan: CGQ<CID, OptimizedHit[]> = (criteria) => flow(
    queryClan(criteria),
    mapL((c) => toValuesKV(c.attacks)),
    flattenL,
);

export const queryDefensesByClan: CGQ<CID, OptimizedHit[]> = (criteria) => flow(
    queryClan(criteria),
    mapL((c) => toValuesKV(c.defenses)),
    flattenL,
);

export const queryPlayersByClan: CGQ<CID, OptimizedPlayer[]> = (criteria) => flow(
    queryClan(criteria),
    mapL((c) => toValuesKV(c.players)),
    flattenL,
);

export const queryPlayer: CGQ<PID, OptimizedPlayer[]> = (criteria) => flow(toPlayers, filterKV((p) => p.data.pid === criteria), toValuesKV);

export const queryAttacksByPlayer: CGQ<PID, OptimizedHit[]> = (criteria) => flow(
    queryPlayer(criteria),
    mapL((p) => toValuesKV(p.attacks)),
    flattenL,
);

export const queryDefensesByPlayer: CGQ<PID, OptimizedHit[]> = (criteria) => flow(
    queryPlayer(criteria),
    mapL((p) => toValuesKV(p.defenses)),
    flattenL,
);
