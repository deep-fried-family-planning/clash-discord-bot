import {CLAN_FAM} from '#src/aws-lambdas/discord_slash/commands/clanfam.ts';
import {ONE_OF_US} from '#src/aws-lambdas/discord_slash/commands/oneofus.ts';
import {SERVER} from '#src/aws-lambdas/discord_slash/commands/server.ts';
import {SMOKE} from '#src/aws-lambdas/discord_slash/commands/smoke.ts';
import {TIME} from '#src/aws-lambdas/discord_slash/commands/time.ts';
import {USER} from '#src/aws-lambdas/discord_slash/commands/user.ts';
import {WA_LINKS} from '#src/aws-lambdas/discord_slash/commands/wa-links.ts';
import {WA_MIRRORS} from '#src/aws-lambdas/discord_slash/commands/wa-mirrors.ts';
import {WA_SCOUT} from '#src/aws-lambdas/discord_slash/commands/wa-scout.ts';

export const COMMANDS = {
    CLAN_FAM,
    ONE_OF_US,
    SERVER,
    SMOKE,
    TIME,
    USER,
    WA_LINKS,
    WA_MIRRORS,
    WA_SCOUT,
} as const;
