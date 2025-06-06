import type {buildGraphModel} from '#src/internal/graph/build-graph-model.ts';
import {descriptiveHitRates} from '#src/internal/graph/model-descriptive/descriptive-hit-rates.ts';
import type {OptimizedHit} from '#src/internal/graph/pipeline/optimize-types.ts';
import {queryAttacksByClan, queryClan, queryWarsByClan} from '#src/internal/graph/query/graph-query.ts';
import {filterL, flattenL, mapL, ofL, reduceL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {num} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import {pipe} from 'effect/Function';
import {collect} from 'effect/Record';
import {mean as meanThrowable, median as medianThrowable, standardDeviation as stdThrowable} from 'simple-statistics';
import {compareTwoStrings} from 'string-similarity';

const median = (xs: num[]) => {
  try {
    return medianThrowable(xs);
  }
  catch (_) {
    return 0;
  }
};

const standardDeviation = (xs: num[]) => {
  try {
    return stdThrowable(xs);
  }
  catch (_) {
    return 0;
  }
};

const mean = (xs: num[]) => {
  try {
    return meanThrowable(xs);
  }
  catch (_) {
    return 0;
  }
};

export const describeScout = (graph: EAR<typeof buildGraphModel>) => {
  const wars = pipe(graph.model, queryWarsByClan(graph.opponentTag));
  const attacks = pipe(graph.model, queryAttacksByClan(graph.opponentTag));

  const record = pipe(graph.model, queryClan(graph.opponentTag), reduceL([0, 0, 0], (rs, c) => {
    if (c.data.stars > c.enemy.data.stars) {
      rs[0] += 1;
    }
    else if (c.data.stars === c.enemy.data.stars) {
      if (c.data.dmg > c.enemy.data.dmg) {
        rs[0] += 1;
      }
      else if (c.data.dmg === c.enemy.data.dmg) {
        rs[2] += 1;
      }
      else if (c.data.dmg < c.enemy.data.dmg) {
        rs[1] += 1;
      }
    }
    else if (c.data.stars < c.enemy.data.stars) {
      rs[1] += 1;
    }

    return rs;
  }));

  const trojanHorseIndex = pipe(attacks, mapL((a) => a.data.order_norm), mean);

  const sequenceIndex = pipe(
    wars,
    mapL((w) => pipe(
      w.hits,
      collect((_, h) => h),
      // filterL(h => h._id_attacker_clan )
      sortL(fromCompare<OptimizedHit>((a, b) => OrdN(a.data.order, b.data.order))),
      reduceL([0, 1, 0], ([contN, isCont, hN], h) => {
        if (h.attacker.clan.data.cid !== graph.opponentTag) {
          isCont = 0;
        }
        if (isCont) {
          contN += 1;
        }
        if (h.attacker.clan.data.cid === graph.opponentTag) {
          isCont = 1;
          hN += 1;
        }
        return [contN, isCont, hN];
      }),
      ofL,
      mapL(([contN, , hN]) => hN === 0
        ? 0
        : contN / hN),
    )),
    flattenL,
    mean,
  );

  const similarityIndex = pipe(
    graph.opponentMembers,
    reduceL([] as num[], (ms, m) => {
      for (const m2 of graph.opponentMembers) {
        if (m.tag !== m2.tag) {
          ms.push(compareTwoStrings(m.name, m2.name));
        }
      }
      return ms;
    }),
    standardDeviation,
    (n) => 1 - (2 * 0.68 * n),
  );

  const hitsAttempt = pipe(attacks, filterL((a) => a.data.ore1 === 0));
  const hitsOre = pipe(attacks, filterL((a) => a.data.ore1 > 0));
  const hitsCcReveal = pipe(attacks, filterL((a) => a.data.ccre > 0));
  const hitsPossible = pipe(wars, reduceL(0, (ws, w) => ws + w.data.rules_size * w.data.rules_atks));

  const hitRates = descriptiveHitRates(graph.opponentTag, graph.opponentMembers, graph.model);

  const warsizes = pipe(wars, mapL((w) => w.data.rules_size));

  const averageWarSize = pipe(warsizes, mean, (n) => n / 5, Math.round, (n) => Math.trunc(n * 5));
  const medianWarSize = median(warsizes);

  const th17hr = pipe(
    attacks,
    filterL((a) => a.attacker.data.th_lvl === 17 && a.defender.data.th_lvl === 17 && a.data.ore1 === 0),
    mapL((a) => a.data.stars === 3
      ? 1
      : 0),
    mean,
  );
  const th16hr = pipe(
    attacks,
    filterL((a) => a.attacker.data.th_lvl === 16 && a.defender.data.th_lvl === 16 && a.data.ore1 === 0),
    mapL((a) => a.data.stars === 3
      ? 1
      : 0),
    mean,
  );

  return {
    wars,
    attacks,
    record: {
      total : record.reduce((rs, r) => rs + r, 0),
      wins  : record[0],
      losses: record[1],
      draws : record[2],
    },
    th16hr,
    th17hr,
    trojanHorseIndex,
    sequenceIndex,
    similarityIndex,
    hitsAttempt,
    hitsOre,
    hitsCcReveal,
    hitsPossible,
    hitRates,
    graph: graph,
    averageWarSize,
    medianWarSize,
  };
};
