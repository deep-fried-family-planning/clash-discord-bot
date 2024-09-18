import type {DerivedModel} from '#src/data/pipeline/derive-types.ts';
import {pipe} from 'fp-ts/function';
import {reduce} from 'fp-ts/Array';
import type {GraphModel} from '#src/data/pipeline/optimize-types.ts';
import type {IDKV} from '#src/data/types.ts';
import type {Player} from 'clashofclans.js';
import console from 'node:console';

export const accumulateWarData = (model: DerivedModel): GraphModel['data'] => {
    const data_initial = {
        ...model,
        wars   : [],
        clans  : [],
        players: [],
        hits   : [],
    } as GraphModel['data'];

    console.log('[GRAPH]: accumulate');

    return pipe(model.wars, reduce(data_initial, (acc, w) => {
        acc.wars.push(w);
        acc.clans.push(...w.clans);
        acc.players.push(...w.players);
        acc.hits.push(...w.hits);
        return acc;
    }));
};

export const optimizeGraphModel = (data: GraphModel['data']): GraphModel => {
    const wars = {} as GraphModel['wars'];
    const clans = {} as GraphModel['clans'];
    const players = {} as GraphModel['players'];
    const hits = {} as GraphModel['hits'];

    for (const c of data.clans) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        clans[c._id] = {
            data    : c,
            players : {},
            attacks : {},
            defenses: {},
        };
    }

    for (const w of data.wars) {
        wars[w._id] = {
            data : w,
            clan1: clans[w.clans[0]._id],
            clan2: clans[w.clans[1]._id],
            clans: {},
            hits : {},
        };
        clans[w.clans[0]._id].war = wars[w._id];
        clans[w.clans[0]._id].enemy = clans[w.clans[1]._id];
        clans[w.clans[1]._id].war = wars[w._id];
        clans[w.clans[1]._id].enemy = clans[w.clans[0]._id];
        wars[w._id].clans[w.clans[0]._id] = clans[w.clans[0]._id];
        wars[w._id].clans[w.clans[1]._id] = clans[w.clans[1]._id];
    }

    for (const p of data.players) {
        players[p._id] = {
            data    : p,
            war     : wars[p._id_war],
            clan    : clans[p._id_clan],
            attacks : {},
            defenses: {},
        };
        clans[p._id_clan].players[p._id] = players[p._id];
    }

    for (const h of data.hits) {
        hits[h._id] = {
            data    : h,
            war     : wars[h._id_war],
            attacker: players[h._id_attacker],
            defender: players[h._id_defender],
        };
        wars[h._id_war].hits[h._id] = hits[h._id];
        players[h._id_attacker].attacks[h._id] = hits[h._id];
        players[h._id_defender].defenses[h._id] = hits[h._id];
        clans[h._id_attacker_clan].attacks[h._id] = hits[h._id];
        clans[h._id_defender_clan].defenses[h._id] = hits[h._id];
    }

    console.log('[GRAPH]: complete');

    return {
        data,
        wars,
        clans,
        players,
        hits,
        current: {
            players: pipe(data.current.players, reduce({} as IDKV<Player>, (acc, p) => {
                acc[p.tag] = p;
                return acc;
            })),
        },
    };
};
