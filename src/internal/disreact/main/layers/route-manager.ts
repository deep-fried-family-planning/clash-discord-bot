import {E, L} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import {Route} from '#src/internal/disreact/entity/index.ts';
import type {opt, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';


const makeEmptyParams = () => ({
  root_id: NONE,
  node_id: NONE,
  pipe_id: NONE,
  curr_id: NONE,
  prev_id: NONE,
});

const makeEmptySearch = () => new URLSearchParams();


const implementation = (baseUrl: str) => E.gen(function * () {
  let params = makeEmptyParams(),
      search = makeEmptySearch();

  const router = {
    parse   : Route.decode,
    parseId : Route.decodeFromData,
    parseUrl: Route.decodeFromControllerEmbed,
    build   : Route.encode,
    buildId : Route.encode,
    buildUrl: Route.encodeUrl(baseUrl),
  };

  let original = {} as Ix.Rest;

  return {
    allocate: (rest: Ix.Rest) => {
      params = makeEmptyParams();
      search = makeEmptySearch();
      original = rest;
    },
    rest      : () => original,
    getBaseUrl: () => baseUrl,
    getParams : () => ({...params}),
    getSearch : () => new URLSearchParams(search),
    getRouter : () => router,
    setParams : (next: opt<typeof params>) => {
      for (const [k, v] of Object.entries(next)) {
        if (!v) {
          params[k as keyof typeof params] = NONE;
        }
        else {
          params[k as keyof typeof params] = v;
        }
      }
    },
    setSearch: (next?: typeof search) => {search = next ?? search},
  };
});


export class RouteManager extends E.Tag('RouteManager')<
  RouteManager,
  EAR<typeof implementation>
>() {
  static makeLayer = (baseUrl: str) => L.effect(this, implementation(baseUrl));
}
