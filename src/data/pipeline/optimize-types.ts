import type {IDKV} from '#src/data/types.ts';
import type {DerivedClan, DerivedHit, DerivedPlayer, DerivedWar} from '#src/data/pipeline/derive-types.ts';
import type {Player} from 'clashofclans.js';

export type OptimizedWar = {
    data : DerivedWar;
    clan1: OptimizedClan;
    clan2: OptimizedClan;
    clans: IDKV<OptimizedClan>;
    hits : IDKV<OptimizedHit>;
};

export type OptimizedClan = {
    data    : DerivedClan;
    war     : OptimizedWar;
    enemy   : OptimizedClan;
    players : IDKV<OptimizedPlayer>;
    attacks : IDKV<OptimizedHit>;
    defenses: IDKV<OptimizedHit>;
};

export type OptimizedPlayer = {
    data    : DerivedPlayer;
    war     : OptimizedWar;
    clan    : OptimizedClan;
    attacks : IDKV<OptimizedHit>;
    defenses: IDKV<OptimizedHit>;
};

export type OptimizedHit = {
    data    : DerivedHit;
    war     : OptimizedWar;
    attacker: OptimizedPlayer;
    defender: OptimizedPlayer;
};

export type GraphModel = {
    data: {
        wars   : DerivedWar[];
        clans  : DerivedClan[];
        players: DerivedPlayer[];
        hits   : DerivedHit[];
        current: {
            players: Player[];
        };
    };
    wars   : IDKV<OptimizedWar>;
    clans  : IDKV<OptimizedClan>;
    players: IDKV<OptimizedPlayer>;
    hits   : IDKV<OptimizedHit>;
    current: {
        players: IDKV<Player>;
    };
};

export type GWars = IDKV<OptimizedWar>;
export type GClans = IDKV<OptimizedClan>;
export type GHits = IDKV<OptimizedHit>;
export type GPlayers = IDKV<OptimizedPlayer>;
