import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import type {snflk} from '#src/internal/discord-old/types.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {emptyKV, reduceKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {EmbedField} from 'dfx/types';

export const isAdmin = (s: St) => s.user_roles.includes(s.server?.admin as snflk);
