import type {St} from '#src/discord/store/derive-state.ts';
import type {snow} from '#src/discord/types.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {emptyKV, reduceKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {EmbedField} from 'dfx/types';


export const isAdmin = (s: St) => s.user_roles.includes(s.server?.admin as snow);


export const toReferenceFields = (fields: Record<str, EmbedField | und>) => pipe(
  fields,
  reduceKV([] as EmbedField[], (fs, f) => {
    if (f) {
      fs.push(f);
    }
    return fs;
  }),
);


export const toReferenceFieldssssss = (fields: Record<str, str | und>) => pipe(
  fields,
  reduceKV([] as EmbedField[], (fs, f, n) => {
    if (f) {
      fs.push({
        name : n.trim(),
        value: f.trim(),
      });
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
