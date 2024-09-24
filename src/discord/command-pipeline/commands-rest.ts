import type {CommandSpec} from '#src/discord/types.ts';
import {pipe} from 'fp-ts/function';
import {mapL} from '#src/data/pure-list.ts';
import {toValuesKV} from '#src/data/pure-kv.ts';
import type {RESTPostAPIApplicationCommandsJSONBody} from 'discord-api-types/v10';

export const specToREST = (spec: CommandSpec) => {
    const options = pipe(spec.options, toValuesKV, mapL((v) =>
        'options' in v
            ? {...v, options: pipe(v.options, toValuesKV, mapL((v2) =>
                    'options' in v2
                        ? {
                                ...v2,
                                options: pipe(v2.options, toValuesKV),
                            }
                        : v2,
                ))}
            : v,
    ));

    return {
        ...spec,
        options,
    } as RESTPostAPIApplicationCommandsJSONBody;
};
