import type {int, isodate} from '#src/data/types-pure.ts';
import type {_Model, CID, IGNAME, PID} from '#src/data/types.ts';
import type {Player} from 'clashofclans.js';
import {type ClanWarMember} from 'clashofclans.js';

export type DispatchedWar =
    & _Model
    & {
        rules_size : int;
        rules_atks : int;
        rules_prep : isodate;
        rules_start: isodate;
        rules_end  : isodate;
        clans      : DispatchedClan[];
        players    : DispatchedPlayer[];
        hits       : DispatchedHit[];
    };

export type DispatchedClan =
    & _Model
    & {
        cid  : CID;
        name : IGNAME;
        level: int;
        stars: int;
        dmg  : int;
    };

export type DispatchedPlayer =
    & _Model
    & {
        cid   : CID;
        pid   : PID;
        name  : IGNAME;
        pos   : int;
        th_lvl: int;
    };

export type DispatchedHit =
    & _Model
    & {
        a_pid   : PID;
        d_pid   : PID;
        order   : int;
        stars   : int;
        dmg_prct: int;
        duration: int;
    };

export type DispatchedModel =
    & _Model
    & {
        wars   : DispatchedWar[];
        current: {
            players: Player[];
        };
    };
