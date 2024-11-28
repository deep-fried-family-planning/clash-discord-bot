import type {CommandSpec, IxDS} from '#src/discord/types.ts';
import {type IxD, IXSOT} from '#src/internal/discord.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';


export const nameOptions = <T extends CommandSpec>(ix: IxD): IxDS<T> => {
    if ('options' in ix.data!) {
        const subgroup = ix.data.options.find((o) => o.type === IXSOT.SUB_COMMAND_GROUP);
        const cmd = ix.data.options.find((o) => o.type === IXSOT.SUB_COMMAND);

        if (subgroup) {
            return subgroup.options![0].options
                ? overrideNames(subgroup.options![0].options) as IxDS<T>
                : {} as IxDS<T>;
        }
        else if (cmd) {
            return cmd.options
                ? overrideNames(cmd.options) as IxDS<T>
                : {} as IxDS<T>;
        }
        else {
            return overrideNames(ix.data.options) as IxDS<T>;
        }
    }

    return {} as IxDS<T>;
};


const overrideNames = <T extends {name: string; value?: unknown}>(options: T[]): Record<string, T['value']> => pipe(
    options,
    reduceL(emptyKV(), (acc, op) => {
        acc[op.name] = op.value;
        return acc;
    }),
);
