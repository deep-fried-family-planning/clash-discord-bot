import type {CommandData, CommandSpec, EmbedSpec, Interaction, SubCommandSpec} from '#src/discord/types.ts';
import {pipe} from 'fp-ts/function';
import {GROUP_OPTION, SUBCMD_OPTION} from '#src/discord/commands-constants.ts';
import {reduceL} from '#src/data/pure-list.ts';
import {show} from '../../../util.ts';

const overrideNames = <T extends {name: string}>(options?: T[]): Record<string, T> =>
    options
        ? pipe(options, reduceL({} as Record<string, T>, (acc, op) => {
            acc[op.name] = op;
            return acc;
        }))
        : {};

export const specCommand = <T extends CommandSpec | SubCommandSpec>(fn: (body: CommandData<T>) => Promise<EmbedSpec[]>) => {
    return async (body: Interaction) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        let options: CommandData<T>['data']['options'] = {};

        if ('options' in body.data && body.data.options) {
            const subgroup = body.data.options.find((o) => o.type === GROUP_OPTION);
            const cmd = body.data.options.find((o) => o.type === SUBCMD_OPTION);

            if (subgroup) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                options = overrideNames(subgroup.options[0].options);
            }
            else if (cmd) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                options = overrideNames(cmd.options);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                options = overrideNames(body.data.options);
            }
        }

        show(options);

        return await fn({
            ...body,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            data: {
                ...body.data,
                options,
            },
        });
    };
};
