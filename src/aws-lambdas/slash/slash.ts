import {time, TIME} from '#src/aws-lambdas/slash/commands/time.ts';
import {Cfg, E, pipe} from '#src/internals/re-exports/effect.ts';
import type {Interaction} from '#src/discord/types.ts';
import {DiscordREST} from 'dfx';
import type {SQSEvent, SQSRecord} from 'aws-lambda';
import {REDACTED_DISCORD_APP_ID} from '#src/constants/secrets.ts';
import {Cause, Redacted} from 'effect';
import {mapL} from '#src/pure/pure-list.ts';
import {ONE_OF_US, oneofus} from '#src/aws-lambdas/slash/commands/oneofus.ts';
import {server, SERVER} from '#src/aws-lambdas/slash/commands/server.ts';
import {CLAN_FAM, clanfam} from '#src/aws-lambdas/slash/commands/clanfam.ts';
import {user, USER} from '#src/aws-lambdas/slash/commands/user.ts';
import {logDiscordError} from '#src/https/calls/log-discord-error.ts';
import {WA_SCOUT, waScout} from '#src/aws-lambdas/slash/commands/wa-scout.ts';
import {WA_LINKS, waLinks} from '#src/aws-lambdas/slash/commands/wa-links.ts';
import {WA_MIRRORS, waMirrors} from '#src/aws-lambdas/slash/commands/wa-mirrors.ts';
import {nameOptions} from '#src/aws-lambdas/slash/options.ts';

const dAppId = Cfg.redacted(REDACTED_DISCORD_APP_ID).pipe(E.map(Redacted.value));

const lookup = {
    [TIME.name]      : time,
    [ONE_OF_US.name] : oneofus,
    [SERVER.name]    : server,
    [CLAN_FAM.name]  : clanfam,
    [USER.name]      : user,
    [WA_LINKS.name]  : waLinks,
    [WA_MIRRORS.name]: waMirrors,
    [WA_SCOUT.name]  : waScout,
} as const;

export const slash = (event: SQSEvent) => pipe(
    event.Records,
    mapL(each),
    E.allWith({concurrency: 1}),
);

const each = (record: SQSRecord) => E.gen(function * () {
    const discord = yield * DiscordREST;

    const interaction = JSON.parse(record.body) as Interaction;

    const root = interaction.data.name as keyof typeof lookup;

    const message = yield * pipe(
        lookup[root](interaction, nameOptions(interaction)),
        E.catchTags({
            DeepFryerSlashUserError: (e) => E.gen(function * () {
                const userMessage = yield * logDiscordError([e]);

                return {
                    ...userMessage,
                    embeds: [{
                        ...userMessage.embeds[0],
                        title: e.issue,
                    }],
                };
            }),
            DeepFryerClashError: (e) => E.gen(function * () {
                const userMessage = yield * logDiscordError([e]);

                return {
                    ...userMessage,
                    embeds: [{
                        ...userMessage.embeds[0],
                        // @ts-expect-error clashperk lib types
                        title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
                    }],
                };
            }),
        }),
        E.catchAllCause((error) => E.gen(function * () {
            const e = Cause.prettyErrors(error);

            return yield * logDiscordError(e);
        })),
    );

    // @ts-expect-error rest api types
    yield * discord.editOriginalInteractionResponse(yield * dAppId, interaction.token, message);
});
