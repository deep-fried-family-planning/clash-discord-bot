import {time, TIME} from '#src/aws-lambdas/slash/commands/time.ts';
import {Cfg, E, pipe} from '#src/internals/re-exports/effect.ts';
import type {Interaction} from '#src/aws-lambdas/menu/old/types.ts';
import {DiscordREST} from 'dfx';
import type {SQSEvent} from 'aws-lambda';
import {REDACTED_DISCORD_APP_ID} from '#src/internals/constants/secrets.ts';
import {Cause, Redacted} from 'effect';
import {mapL} from '#src/pure/pure-list.ts';
import {ONE_OF_US, oneofus} from '#src/aws-lambdas/slash/commands/oneofus.ts';
import {server, SERVER} from '#src/aws-lambdas/slash/commands/server.ts';
import {CLAN_FAM, clanfam} from '#src/aws-lambdas/slash/commands/clanfam.ts';
import {user, USER} from '#src/aws-lambdas/slash/commands/user.ts';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {WA_SCOUT, waScout} from '#src/aws-lambdas/slash/commands/wa-scout.ts';
import {WA_LINKS, waLinks} from '#src/aws-lambdas/slash/commands/wa-links.ts';
import {WA_MIRRORS, waMirrors} from '#src/aws-lambdas/slash/commands/wa-mirrors.ts';
import {nameOptions} from '#src/aws-lambdas/slash/options.ts';
import {SMOKE, smoke} from '#src/aws-lambdas/slash/commands/smoke.ts';
import type {EditWebhookMessageParams} from 'dfx/types';

const dAppId = Cfg.redacted(REDACTED_DISCORD_APP_ID).pipe(E.map(Redacted.value));

const lookup = {
    [CLAN_FAM.name]  : clanfam,
    [ONE_OF_US.name] : oneofus,
    [SERVER.name]    : server,
    [SMOKE.name]     : smoke,
    [TIME.name]      : time,
    [USER.name]      : user,
    [WA_LINKS.name]  : waLinks,
    [WA_MIRRORS.name]: waMirrors,
    [WA_SCOUT.name]  : waScout,
} as const;

export const slash = (event: SQSEvent) => pipe(
    event.Records,
    mapL((record) => {
        const interaction = JSON.parse(record.body) as Interaction;

        return each(interaction);
    }),
    E.allWith({concurrency: 1}),
);

const each = (interaction: Interaction) => E.gen(function * () {
    const root = interaction.data.name as keyof typeof lookup;

    const message = yield * lookup[root](interaction, nameOptions(interaction));

    const discord = yield * DiscordREST;
    yield * discord.editOriginalInteractionResponse(yield * dAppId, interaction.token, message);
}).pipe(
    E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function * () {
        const userMessage = yield * logDiscordError([e]);

        const discord = yield * DiscordREST;
        yield * discord.editOriginalInteractionResponse(yield * dAppId, interaction.token, {
            ...userMessage,
            embeds: [{
                ...userMessage.embeds[0],
                title: e.issue,
            }],
        } as Partial<EditWebhookMessageParams>);
    })),
    E.catchTag('DeepFryerClashError', (e) => E.gen(function * () {
        const userMessage = yield * logDiscordError([e]);

        const discord = yield * DiscordREST;
        yield * discord.editOriginalInteractionResponse(yield * dAppId, interaction.token, {
            ...userMessage,
            embeds: [{
                ...userMessage.embeds[0],
                // @ts-expect-error clashperk lib types
                title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
            }],
        } as Partial<EditWebhookMessageParams>);
    })),
    E.catchAllCause((error) => E.gen(function * () {
        const e = Cause.prettyErrors(error);

        const userMessage = yield * logDiscordError(e);

        const discord = yield * DiscordREST;
        yield * discord.editOriginalInteractionResponse(yield * dAppId, interaction.token, userMessage);
    })),
);
