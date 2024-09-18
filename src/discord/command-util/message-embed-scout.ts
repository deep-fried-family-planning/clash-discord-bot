import {
    dBold,
    dCode,
    dHdr3,
    dLines,
    dNotA,
    dSubC,
    nIdex,
    nNatr,
    nPrct,
} from '#src/discord/command-util/message.ts';
import {pipe} from 'fp-ts/function';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {mapL} from '#src/data/pure-list.ts';
import type {describeScout} from '#src/data/model-descriptive/describe-scout.ts';

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
            ['th16 hit rate', nPrct(scout.th16hr), ''],
            ['3 star attempts', nNatr(scout.hitsAttempt.length / scout.wars.length), nPrct((scout.hitsAttempt.length) / scout.hitsPossible)],
            ['hits missed', nNatr((scout.hitsPossible - scout.attacks.length) / scout.wars.length), nPrct((scout.hitsPossible - scout.attacks.length) / scout.hitsPossible)],
            ['ore hits', nNatr(scout.hitsOre.length / scout.wars.length), nPrct((scout.hitsOre.length) / scout.hitsPossible)],
            ['cc reveal hits', nNatr(scout.hitsCcReveal.length / scout.wars.length), nPrct((scout.hitsCcReveal.length) / scout.hitsPossible)],
            ['average war size', nNatr(scout.averageWarSize), ''],
        ]), mapL(dSubC)),
    ].flat());
};
