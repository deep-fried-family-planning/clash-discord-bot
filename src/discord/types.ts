import type {
    APIEmbed,
    APIApplicationCommandAutocompleteInteraction,
    APIApplicationCommandInteraction,
} from 'discord-api-types/v10';
import {pipe} from 'fp-ts/function';
import {map} from 'fp-ts/Array';
import type {CommandConfig} from '#src/discord/commands.ts';
import {fromEntries} from 'fp-ts/Record';

type DiscordInteraction =
    | APIApplicationCommandAutocompleteInteraction
    | APIApplicationCommandInteraction;

export type EmbedSpec =
    & Omit<APIEmbed, 'description' | 'footer'>
    & {
        desc   : string[];
        footer?: string[];
    };

type ResolvedInput<T extends CommandConfig> =
    & Omit<Extract<DiscordInteraction, {data: {options: unknown[]}}>, 'data'>
    & {
        data: Omit<Extract<DiscordInteraction, {data: {options: unknown[]}}>['data'], 'options'> & {
            options: {
                // [k in T['options'][number]['name']]: (Extract<T['options'], {name: k}> & {value: any})
                [k in T['options'][number] as T['options'][number]['name']]: Extract<T['options'][number], {name: k['name']}> extends {required: true}
                    ? string
                    : string | undefined;
            };
        };
    };

export const buildCommand
    = <
        T extends CommandConfig,
        R extends EmbedSpec[] = EmbedSpec[],
    >
    (spec: T, fn: (outer: ResolvedInput<T>) => Promise<R>) => {
        const getOps
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
            = map((option) => (ops) => [option.name, ops?.filter((o) => o.name === option.name)[0]?.value])(spec.options);

        return [spec.name, async (inner: DiscordInteraction) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const namedOptions = pipe(getOps, map((getter) => getter(inner.data.options)), fromEntries);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            inner.data.options = namedOptions;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return await fn(inner);
        }] as const;
    };
