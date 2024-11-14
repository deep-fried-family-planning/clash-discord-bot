import type {int, isodate, unixdate, url} from '#src/internal/pure/types-pure.ts';

export type CK_War_Member = {
    tag               : string;
    name              : string;
    townhallLevel     : int;
    mapPosition       : int;
    attacks?          : CK_War_Hit[];
    opponentAttacks   : int;
    bestOpponentAttack: CK_War_Hit;
};

export type CK_War_Clan = {
    tag      : string;
    name     : string;
    badgeUrls: {
        small : url;
        large : url;
        medium: url;
    };
    clanLevel            : int;
    attacks              : int;
    stars                : int;
    destructionPercentage: int;
    members              : CK_War_Member[];
};

export type CK_War_Hit = {
    attackerTag          : string;
    defenderTag          : string;
    stars                : int;
    destructionPercentage: int;
    order                : int;
    duration             : int;
};

export type CK_War = {
    state               : string;
    teamSize            : int;
    attacksPerMember?   : int;
    battleModifier      : string;
    preparationStartTime: isodate;
    startTime           : isodate;
    endTime             : isodate;
    status_code         : int;
    timestamp           : unixdate;
    _response_retry     : 120;
    clan                : CK_War_Clan;
    opponent            : CK_War_Clan;
};
