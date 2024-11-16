import {CLAN_FAM, clanfam} from '#src/discord/ixs/link/clanfam.ts';
import {ONE_OF_US, oneofus} from '#src/discord/ixs/link/oneofus.ts';
import {server, SERVER} from '#src/discord/ixs/link/server.ts';
import {smoke, SMOKE} from '#src/discord/ixs/util/smoke.ts';
import {time, TIME} from '#src/discord/ixs/util/time.ts';
import {user, USER} from '#src/discord/ixs/link/user.ts';
import {WA_LINKS, waLinks} from '#src/discord/ixs/war-analysis/wa-links.ts';
import {WA_MIRRORS, waMirrors} from '#src/discord/ixs/war-analysis/wa-mirrors.ts';
import {WA_SCOUT, waScout} from '#src/discord/ixs/war-analysis/wa-scout.ts';
import {CACHE_BUST, cacheBust} from '#src/discord/ixs/util/cache-bust.ts';
import {GIMME_DATA, gimmeData} from '#src/discord/ixs/util/gimme-data.ts';


export const IXS_SPECS = {
    CLAN_FAM,
    ONE_OF_US,
    SERVER,
    SMOKE,
    TIME,
    USER,
    WA_LINKS,
    WA_MIRRORS,
    WA_SCOUT,
    CACHE_BUST,
    GIMME_DATA,
} as const;


export const IXS_LOOKUP = {
    [CLAN_FAM.name]  : clanfam,
    [ONE_OF_US.name] : oneofus,
    [SERVER.name]    : server,
    [SMOKE.name]     : smoke,
    [TIME.name]      : time,
    [USER.name]      : user,
    [WA_LINKS.name]  : waLinks,
    [WA_MIRRORS.name]: waMirrors,
    [WA_SCOUT.name]  : waScout,
    [CACHE_BUST.name]: cacheBust,
    [GIMME_DATA.name]: gimmeData,
} as const;
