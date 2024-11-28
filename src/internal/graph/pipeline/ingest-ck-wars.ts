import {attachModelId} from '#src/internal/graph/types.ts';
import type {CK_War, CK_War_Clan} from '#src/clash/api-ck-get-previous-wars.ts';
import type {DispatchedClan, DispatchedHit, DispatchedPlayer, DispatchedWar} from '#src/internal/graph/pipeline/ingest-types.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {flatMapL, mapL} from '#src/internal/pure/pure-list.ts';

const ingestCkWarPlayers = (clan: CK_War_Clan): DispatchedPlayer[] => pipe(
    clan.members,
    mapL((m) => attachModelId({
        cid   : clan.tag,
        pid   : m.tag,
        name  : m.name,
        pos   : m.mapPosition,
        th_lvl: m.townhallLevel,
    })),
);

const ingestCkWarHits = (clan: CK_War_Clan): DispatchedHit[] => pipe(
    clan.members,
    flatMapL((m) => m.attacks ?? []),
    mapL((a) => attachModelId({
        a_pid   : a.attackerTag,
        d_pid   : a.defenderTag,
        order   : a.order,
        stars   : a.stars,
        dmg_prct: a.destructionPercentage,
        duration: a.duration,
    })),
);

const ingestCkWarClan = (clan: CK_War_Clan): DispatchedClan => attachModelId({
    cid  : clan.tag,
    name : clan.name,
    level: clan.clanLevel,
    stars: clan.stars,
    dmg  : clan.destructionPercentage,
});

export const ingestCkWar = (war: CK_War): DispatchedWar => attachModelId({
    rules_size : war.teamSize,
    rules_atks : war.attacksPerMember ?? 1,
    rules_prep : war.preparationStartTime,
    rules_start: war.startTime,
    rules_end  : war.endTime,
    clans      : pipe([war.clan, war.opponent], mapL(ingestCkWarClan)),
    players    : pipe([war.clan, war.opponent], flatMapL(ingestCkWarPlayers)),
    hits       : pipe([war.clan, war.opponent], flatMapL(ingestCkWarHits)),
});
