import type {RestEmbed} from '#src/internal/ix-system/model/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Ar, Kv, p} from '#src/internal/pure/effect.ts';


export const make = <
    T extends keyof RestEmbed,
    U extends keyof RestEmbed,
>(
    config: {
        name  : str;
        label : str;
        // todo can we use url or subheader encoding for id parameters
        // id: {
        //     key   : T;
        //     subkey?: keyof Required<RestEmbed>[T];
        // };
        // target: {
        //     key: U;
        //     subkey?: keyof Required<RestEmbed>[U];
        // }
        encode: (ex: RestEmbed, sc: unknown) => RestEmbed;
        decode: (ex: RestEmbed) => Record<str, unknown>;
    },
) => ({
    ...config,
    encode: (ex: RestEmbed, sc: unknown): RestEmbed => ({
        ...ex,
        ...config.encode(ex, sc),
        author: {
            name: config.label,
        },
    }),
});


export const labelLookup = <
    T extends ReturnType<typeof make>[],
>(
    protocols: T,
) => p(
    protocols,
    Kv.fromIterableWith((p) => [p.label, p]),
);


export const nameLookup = <
    T extends ReturnType<typeof make>[],
>(
    protocols: T,
) => p(
    protocols,
    Kv.fromIterableWith((p) => [p.name, p]),
);


export const none = make({
    name  : '',
    label : '',
    encode: (ex: RestEmbed) => ex,
    decode: () => ({}),
});


export const exJson = make({
    name  : 'ex-json',
    label : 'JSON Record',
    encode: (ex, sc) => ({
        ...ex,
        description: JSON.stringify(sc),
    }),
    decode: (ex) => JSON.parse(ex.description!) as Record<str, unknown>,
});


export const fieldJson = make({
    name  : 'ex-field-json',
    label : 'JSON Field',
    encode: (ex, sc) => ({
        ...ex,
        description: JSON.stringify(sc),
    }),
    decode: (ex) => JSON.parse(ex.description!) as Record<str, unknown>,
});


const protocols = [
    exJson,
    fieldJson,
];


export const standard = {
    name : nameLookup(protocols),
    label: labelLookup(protocols),
};
