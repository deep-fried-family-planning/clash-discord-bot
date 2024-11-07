import {callClashKing} from '#src/https/api-ck.ts';
import type {int, isodate, num, url} from '#src/pure/types-pure.ts';
import type {CID, PID} from '#src/data/types.ts';
import {Schema as S} from 'effect'


export type CK_Player_PriorClanHits = S.Schema.Type<typeof CK_Player_PreviousHitsClan>;

export const CK_Player_PreviousHitsClan = S.Struct({
    tag: S.String,
    name: S.String,
    badgeUrls: S.Struct({small: S.String, large: S.String, medium: S.String}),
    clanLevel: S.Int,
    attacks: S.Int,
    stars: S.Int,
    destructionPercentage: S.Number,
});


// TODO
// Not entirely sure what's wrong here
export type CK_Player_PriorHitsAttack = S.Schema.Type<typeof CK_Player_PreviousHitsAttack>;

export const CK_Player_PreviousHitsAttack = S.Struct{(
    attackerTag : S.String,
    _defenderTag : S.String,
    stars : S.Int,
    destructionPercentage : S.Number,
    order : S.Int,
    duration : S.Int,
    fresh : S.Boolean,
    defender : S.Struct ({tag : S.String, name : S.String, townhallLevel : S.Int, mapPosition: S.Int, opponentAttacks : S.Int}),
    attack_order : S.Int,
)};

export type CK_Player_PriorHits = S.Schema.Type<typeof CK_Player_PreviousHits>;

export const CK_Player_PreviousHits = S.Struct({
   war_data: S.Struct({
       state : S.String,
       teamSize : S.Int,
       attacksPerMember : S.Int,
       battleModifier : S.String,
       preparationStartTime : S.String,
       startTIme : S.String,
       endTIme : S.String,
       clan : CK_Player_PreviousHitsClan,
       opponent : CK_Player_PreviousHitsClan,
       type : S.Literal('random'),
   }),
    attacks : CK_Player_PreviousHitsAttack[],
    defenses: CK_Player_PreviousHitsAttack[],
});

// export type CK_Player_PreviousHitsClan = {
//     tag      : CID;
//     name     : string;
//     badgeUrls: {
//         small : url;
//         large : url;
//         medium: url;
//     };
//     clanLevel            : int;
//     attacks              : int;
//     stars                : int;
//     destructionPercentage: num;
// };


// export type CK_Player_PreviousHitsAttack = {
//     attackerTag          : PID;
//     defenderTag          : PID;
//     stars                : int;
//     destructionPercentage: num;
//     order                : int;
//     duration             : int;
//     fresh                : boolean;
//     defender: {
//         tag            : PID;
//         name           : string;
//         townhallLevel  : int;
//         mapPosition    : int;
//         opponentAttacks: int;
//     };
//     attack_order: int;
// };

// export type CK_Player_PreviousHits = {
//     war_data: {
//         state               : string;
//         teamSize            : int;
//         attacksPerMember    : int;
//         battleModifier      : string;
//         preparationStartTime: isodate;
//         startTime           : isodate;
//         endTime             : isodate;
//         clan                : CK_Player_PreviousHitsClan;
//         opponent            : CK_Player_PreviousHitsClan;
//         type                : 'random';
//     };
//     member_data: {
//         tag            : PID;
//         name           : string;
//         townhallLevel  : int;
//         mapPosition    : int;
//         opponentAttacks: int;
//     };
//     attacks : CK_Player_PreviousHitsAttack[];
//     defenses: CK_Player_PreviousHitsAttack[];
// };

export const callPreviousHitsByPlayer = async (tag: string, limit: num) => await callClashKing<{items: CK_Player_PreviousHits[]}>({
    method: 'GET',
    path  : `/player/${encodeURIComponent(tag)}/warhits`,
    query : {
        timestamp_start: 0,
        timestamp_end  : 2527625513,
        limit          : limit,
    },
});

export const callCkWarsByPlayer = async (pids: string[], limit: num): Promise<CK_Player_PreviousHits[]> => {
    const wars = [] as CK_Player_PreviousHits[];

    for (const pid of pids) {
        wars.push(...(await callPreviousHitsByPlayer(pid, limit)).contents.items);
    }

    return wars;
};
