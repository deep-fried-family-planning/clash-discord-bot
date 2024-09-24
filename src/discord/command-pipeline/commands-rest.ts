import type {CommandSpec} from '#src/discord/types.ts';
import {pipe} from 'fp-ts/function';
import {mapL, sortL} from '#src/data/pure-list.ts';
import {toValuesKV} from '#src/data/pure-kv.ts';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';
import {fromCompare} from 'fp-ts/Ord';
import {OrdB} from '#src/data/pure.ts';
import console from 'node:console';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error

const sorter = fromCompare((a, b) => OrdB.compare(Boolean(b.required), Boolean(a.required)));

export const specToREST = (spec: CommandSpec) => {
    const options = pipe(spec.options, toValuesKV, sortL(sorter), mapL((v) =>
        'options' in v
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ? {...v, options: pipe(v.options, toValuesKV, sortL(sorter), mapL((v2) =>
                    'options' in v2
                        ? {
                                ...v2,
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-expect-error
                                options: pipe(v2.options, toValuesKV, sortL(sorter)),
                            }
                        : v2,
                ))}
            : v,
    ));

    console.log(spec.name, options);

    return {
        ...spec,
        options,
    } as RESTPostAPIApplicationCommandsJSONBody;
};
