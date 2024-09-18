import type {n_bool, num} from '#src/data/types-pure.ts';
import type {DispatchedClan, DispatchedHit, DispatchedModel, DispatchedPlayer, DispatchedWar} from '#src/data/pipeline/ingest-types.ts';
import type {UUID} from '#src/data/types.ts';

export type DerivedWar =
    & DispatchedWar
    & {
        clans: (DispatchedClan & {
            _id_war: UUID;
            // score_stars     : num;
            // score_dmg       : num;
            // score_duration  : num;
            // score_atks      : num;
            // score_atks_total: num;
        })[];
        players: (DispatchedPlayer & {
            _id_war : UUID;
            _id_clan: UUID;
        })[];
        hits: (DispatchedHit & {
            _id_war          : UUID;
            _id_attacker     : UUID;
            _id_attacker_clan: UUID;
            _id_defender     : UUID;
            _id_defender_clan: UUID;
            order_norm       : num;
            ore0             : num; // all hits after are an ore hit
            ore1             : num; // is current hit an ore hit
            ccre             : num; // is current hit a cc reveal
            // real             : num;
        })[];
    };

export type DerivedHit = DerivedWar['hits'][number];
export type DerivedClan = DerivedWar['clans'][number];
export type DerivedPlayer = DerivedWar['players'][number];

export type DerivedModel =
    & Omit<DispatchedModel, 'wars'>
    & {
        wars: DerivedWar[];
    };
