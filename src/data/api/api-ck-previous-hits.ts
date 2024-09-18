import {callClashKing} from '#src/data/api/api-ck.ts';
import type {int, isodate, num, url} from '#src/data/types-pure.ts';
import type {CID, PID} from '#src/data/types.ts';

export type CK_Player_PreviousHitsClan = {
    tag      : CID;
    name     : string;
    badgeUrls: {
        small : url;
        large : url;
        medium: url;
    };
    clanLevel            : int;
    attacks              : int;
    stars                : int;
    destructionPercentage: num;
};

export type CK_Player_PreviousHitsAttack = {
    attackerTag          : PID;
    defenderTag          : PID;
    stars                : int;
    destructionPercentage: num;
    order                : int;
    duration             : int;
    fresh                : boolean;
    defender: {
        tag            : PID;
        name           : string;
        townhallLevel  : int;
        mapPosition    : int;
        opponentAttacks: int;
    };
    attack_order: int;
};

export type CK_Player_PreviousHits = {
    war_data: {
        state               : string;
        teamSize            : int;
        attacksPerMember    : int;
        battleModifier      : string;
        preparationStartTime: isodate;
        startTime           : isodate;
        endTime             : isodate;
        clan                : CK_Player_PreviousHitsClan;
        opponent            : CK_Player_PreviousHitsClan;
        type                : 'random';
    };
    member_data: {
        tag            : PID;
        name           : string;
        townhallLevel  : int;
        mapPosition    : int;
        opponentAttacks: int;
    };
    attacks : CK_Player_PreviousHitsAttack[];
    defenses: CK_Player_PreviousHitsAttack[];
};

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
