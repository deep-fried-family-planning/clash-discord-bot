import type {CID, PID} from '#src/internal/graph/types.ts';
import type {int, isodate, num, url} from '#src/internal/pure/types-pure.ts';



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
