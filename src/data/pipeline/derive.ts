import type {DispatchedClan, DispatchedModel, DispatchedPlayer, DispatchedWar} from '#src/data/pipeline/ingest-types.ts';
import type {DerivedHit, DerivedModel, DerivedWar} from '#src/data/pipeline/derive-types.ts';
import {pipe} from 'fp-ts/function';
import {filter, map, reduce, sort} from 'fp-ts/Array';
import type {IDKV} from '#src/data/types.ts';
import type {n_bool} from '#src/data/types-pure.ts';
import console from 'node:console';
import {orderHits} from '#src/data/pure.ts';

export const deriveWar = (war: DispatchedWar): DerivedWar => {
    const clans = pipe(war.clans, reduce({} as IDKV<DispatchedClan>, (acc, c) => {
        acc[c.cid] = c;
        return acc;
    }));

    const players = pipe(war.players, reduce({} as IDKV<DispatchedPlayer>, (acc, p) => {
        acc[p.pid] = p;
        return acc;
    }));

    const hits = pipe(
        war.hits,
        sort(orderHits),
        reduce({ore: {}, hits: []} as {ore: IDKV<n_bool>; hits: DerivedHit[]}, (acc, h) => {
            let ore0 = 0,
                ore1 = 0;

            if (acc.ore[h.d_pid] === 1) {
                ore1 = 1;
            }

            if (h.stars === 3 && ore1 === 0) {
                acc.ore[h.d_pid] = 1;
                ore0 = 1;
            }

            const attacker = players[h.a_pid];
            const defender = players[h.d_pid];
            const th_lvl_diff = defender.th_lvl - attacker.th_lvl;

            acc.hits.push({
                ...h,

                _id_war          : war._id,
                _id_attacker     : players[h.a_pid]._id,
                _id_attacker_clan: clans[players[h.a_pid].cid]._id,
                _id_defender     : players[h.d_pid]._id,
                _id_defender_clan: clans[players[h.d_pid].cid]._id,

                order_norm: h.order / (war.hits.length), // 2 attacks per member per clan
                // order_norm : h.order / (war.rules_atks * war.rules_size * 2), // 2 attacks per member per clan

                ore0,
                ore1,
                ccre: (!acc.ore[h.d_pid] && th_lvl_diff >= 2)
                    ? 1
                    : 0,

            });

            return acc;
        }),
    ).hits;

    return {
        ...war,
        clans: pipe(war.clans, map((c) => {
            const chits = pipe(hits, filter((h) => h._id_attacker_clan === c.cid));

            return {
                ...c,
                _id_war         : war._id,
                score_atks_total: chits.length,
                score_atks      : chits.length,
            };
        })),
        players: pipe(war.players, map((p) => ({
            ...p,
            _id_war : war._id,
            _id_clan: clans[p.cid]._id,
        }))),
        hits: hits,
    };
};

export const deriveModel = (model: DispatchedModel): DerivedModel => {
    console.log('[DERIVE]: starting...');

    return {
        ...model,
        current: model.current,
        wars   : pipe(model.wars, map(deriveWar)),
    };
};
