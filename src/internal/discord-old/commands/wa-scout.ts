import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {OPTION_CLAN, OPTION_EXHAUSTIVE, OPTION_LIMIT} from '#src/constants/ix-constants.ts';
import type {CommandSpec, IxDS} from '#src/internal/discord-old/types.ts';
import {dBold, dCode, dHdr1, dHdr3, dLines, dNotA, dSubC, nIdex, nNatr, nPrct} from '#src/internal/discord-old/util/markdown.ts';
import {dTable} from '#src/internal/discord-old/util/message-table.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
import {buildGraphModel} from '#src/internal/graph/build-graph-model.ts';
import {describeSamples} from '#src/internal/graph/model-descriptive/describe-samples.ts';
import {describeScout} from '#src/internal/graph/model-descriptive/describe-scout.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {toEntries} from 'effect/Record';



export const WA_SCOUT
               = {
  type       : 1,
  name       : 'wa-scout',
  description: 'learn enemy clan behaviors and capabilities through a range of war statistics',
  options    : {
    ...OPTION_CLAN,
    ...OPTION_LIMIT,
    ...OPTION_EXHAUSTIVE,
  },
} as const satisfies CommandSpec;


export const waScout = (ix: IxD, ops: IxDS<typeof WA_SCOUT>) => E.gen(function* () {
  yield * validateServer(ix);

  const clan = getAliasTag(ops.clan);

  const graph = yield * buildGraphModel({
    cid1       : clan,
    exhaustive : Boolean(ops.exhaustive),
    from       : 1,
    to         : 50,
    limit      : (ops.limit ?? 50) as number,
    showCurrent: false,
    showN      : false,
  });

  const n_samples = describeSamples(graph.model);
  const scout     = describeScout(graph);

  return {
    embeds: [{
      color      : nColor(COLOR.ORIGINAL),
      description: dLines([
        dHdr1(`${graph.currentWar.clan.name} War Scouting`),
        '',
        dBold('entity sample size'),
        ...pipe(n_samples, toEntries, mapL(([k, v]) => [k, nNatr(v)]), dTable, mapL(dCode)),
      ].flat()).join(''),
    }, {
      color      : nColor(COLOR.INFO),
      description: messageEmbedScout(scout).join(''),
    }],
  };
});


export const messageEmbedScout = (scout: ReturnType<typeof describeScout>) => {
  return dLines([
    dHdr3(`War Log Analysis n=${scout.wars.length} wars`),
    pipe(dTable([
      [`name`, scout.graph.opponentMembers[0].clan.name],
      [`tag`, scout.graph.opponentTag],
      [`W-L-D`, `${(scout.record.wins)}-${(scout.record.losses)}-${(scout.record.draws)}`],
    ]), mapL(dCode)),
    dBold('scouting index'),
    pipe(dTable([
      ['win:loss', nIdex(scout.record.wins / scout.record.losses), ''],
      ['trojan', nIdex(scout.trojanHorseIndex), '0 = early, 1 = late'],
      ['sequence', nIdex(scout.sequenceIndex), '1 = 1-man-army'],
      ['similarity', nIdex(scout.similarityIndex), '1 = 1-man-army'],
      ['activity', dNotA(), ''],
      ['attack 𝞰', dNotA(), ''],
      ['defend 𝞰', dNotA(), ''],
      ['weight 𝞰', dNotA(), '0 = maxers'],
    ]), mapL(dSubC)),
    dBold('war operations'),
    pipe(dTable([
      ['th17 hit rate', nPrct(scout.th17hr), ''],
      ['th16 hit rate', nPrct(scout.th16hr), ''],
      ['3 star attempts', nNatr(scout.hitsAttempt.length / scout.wars.length), nPrct((scout.hitsAttempt.length) / scout.hitsPossible)],
      ['hits missed', nNatr((scout.hitsPossible - scout.attacks.length) / scout.wars.length), nPrct((scout.hitsPossible - scout.attacks.length) / scout.hitsPossible)],
      ['ore hits', nNatr(scout.hitsOre.length / scout.wars.length), nPrct((scout.hitsOre.length) / scout.hitsPossible)],
      ['cc reveal hits', nNatr(scout.hitsCcReveal.length / scout.wars.length), nPrct((scout.hitsCcReveal.length) / scout.hitsPossible)],
      ['average war size', nNatr(scout.averageWarSize), ''],
    ]), mapL(dSubC)),
  ].flat());
};
