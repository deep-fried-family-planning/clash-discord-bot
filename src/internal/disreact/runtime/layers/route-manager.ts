import {E, L} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import {Route} from '#src/internal/disreact/entity/index.ts';
import type {opt, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';


const makeEmptyParams = () => ({
  pipe_id    : NONE,
  root_id    : NONE,
  node_id    : NONE,
  last_id    : NONE,
  curr_id    : NONE,
  defer      : NONE,
  prev_id    : NONE,
  prev_active: NONE,
  prev_token : NONE,
});

const makeEmptySearch = () => new URLSearchParams();


const implementation = (baseUrl: str) => E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);
  const router    = {
    parse   : Route.decode,
    parseId : Route.decodeFromData,
    parseUrl: Route.decodeFromControllerEmbed,
    build   : Route.encode,
    buildId : Route.encode,
    buildUrl: Route.encodeUrl(baseUrl),
  };

  let params   = makeEmptyParams(),
      search   = makeEmptySearch(),
      original = {} as Ix.Rest;

  return {
    allocate: (rest: Ix.Rest) => mutex(E.sync(() => {
      params   = makeEmptyParams();
      search   = makeEmptySearch();
      original = rest;
    })),
    rest     : () => mutex(E.succeed(original)),
    getParams: () => mutex(E.succeed({...params})),
    getSearch: () => mutex(E.succeed(new URLSearchParams(search))),
    getRouter: () => mutex(E.succeed(router)),
    setParams: (next: opt<typeof params>) => mutex(E.sync(() => {
      for (const [k, v] of Object.entries(next)) {
        if (!v) {
          params[k as keyof typeof params] = NONE;
        }
        else {
          params[k as keyof typeof params] = v;
        }
      }
    })),
    setSearch: (next?: typeof search) => mutex(E.sync(() => {
      search = next ?? search;
    })),
  };
});


export class RouteManager extends E.Tag('RouteManager')<
  RouteManager,
  EAR<typeof implementation>
>() {
  static makeLayer = (baseUrl: str) => L.effect(this, implementation(baseUrl));
}
