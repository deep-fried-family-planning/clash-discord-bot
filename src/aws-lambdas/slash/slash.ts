import {time, TIME} from '#src/aws-lambdas/slash/commands/time.ts';
import {Cfg, E, pipe} from '#src/utils/effect.ts';
import type {Interaction} from '#src/discord/types.ts';
import {DiscordREST} from 'dfx';
import type {SQSEvent, SQSRecord} from 'aws-lambda';
import {REDACTED_DISCORD_APP_ID} from '#src/constants/secrets.ts';
import {Redacted} from 'effect';
import {mapL, reduceL} from '#src/pure/pure-list.ts';
import {GROUP_OPTION, SUBCMD_OPTION} from '#src/discord/commands-constants.ts';
import {emptyKV} from '#src/pure/pure-kv.ts';

const dAppId = Cfg.redacted(REDACTED_DISCORD_APP_ID).pipe(E.map(Redacted.value));

const lookup = {
    [TIME.name]: time,
};

export const slash = (event: SQSEvent) => pipe(
    event.Records,
    mapL(each),
    E.allWith({concurrency: 1}),
);

const each = (record: SQSRecord) => E.gen(function * () {
    const interaction = JSON.parse(record.body) as Interaction;

    const root = interaction.data.name as keyof typeof lookup;

    const message = yield * lookup[root](
        interaction,
        nameOptions(interaction) as Parameters<typeof lookup[typeof root]>[1],
    );

    const discord = yield * DiscordREST;

    yield * discord.editOriginalInteractionResponse(yield * dAppId, interaction.token, message);
});

const nameOptions = (data: Interaction) => {
    if ('options' in data.data) {
        const subgroup = data.data.options.find((o) => o.type === GROUP_OPTION);
        const cmd = data.data.options.find((o) => o.type === SUBCMD_OPTION);

        if (subgroup) {
            return overrideNames(subgroup.options[0].options);
        }
        else if (cmd) {
            return overrideNames(cmd.options);
        }
        else {
            return overrideNames(data.data.options);
        }
    }

    return {};
};

const overrideNames
    = <
        T extends {name: string; value?: unknown},
    >
    (options?: T[]): Record<string, T['value']> =>
        options
            ? pipe(options, reduceL(emptyKV(), (acc, op) => {
                acc[op.name] = op.value;
                return acc;
            }))
            : {};
