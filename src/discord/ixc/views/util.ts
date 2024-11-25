import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {snflk} from '#src/discord/types.ts';
import type {EmbedField} from 'dfx/types';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {emptyKV, reduceKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';


export const isAdmin = (s: IxState) => s.user_roles.includes(s.server?.admin as snflk);


export const toReferenceFields = (fields: Record<str, EmbedField | und>) => pipe(
    fields,
    reduceKV([] as EmbedField[], (fs, f) => {
        if (f) {
            fs.push(f);
        }
        return fs;
    }),
);


export const fromReferenceFields = (fields?: EmbedField[]) => fields
    ? pipe(
        fields,
        reduceL(emptyKV<str, EmbedField | und>(), (fs, f) => {
            fs[f.name] = f;
            return fs;
        }),
    )
    : {};
