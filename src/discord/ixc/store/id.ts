import {inject} from 'regexparam';
import type {str} from '#src/internal/pure/types-pure.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {filterL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV, keysKv} from '#src/internal/pure/pure-kv.ts';
import type {RDXT} from '#src/discord/ixc/store/types.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ID_ROUTES, type Route, type RouteParams, DELIM} from '#src/discord/ixc/store/id-routes.ts';


