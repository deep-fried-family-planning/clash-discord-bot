import type {CommandSpec} from '#src/aws-lambdas/menu/old/types.ts';
import {mapL, sortL} from '#src/pure/pure-list.ts';
import {toValuesKV} from '#src/pure/pure-kv.ts';
import {OrdB, fromCompare} from '#src/pure/pure.ts';
import console from 'node:console';
import {pipe} from '#src/internals/re-exports/effect.ts';
import type {CreateGlobalApplicationCommandParams} from 'dfx/types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error

const sorter = fromCompare((a, b) => OrdB(Boolean(b.required), Boolean(a.required)));

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
    } as unknown as CreateGlobalApplicationCommandParams;
};
