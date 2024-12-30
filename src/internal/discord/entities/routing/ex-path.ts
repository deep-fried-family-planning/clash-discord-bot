import {NONE, NONE_NUM} from '#discord/entities/constants/constants.ts';
import {makePathBuilder, makePathParser, makePathPattern, mapParam, setParam, setParamWith} from '#discord/entities/routing/template-path.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import type {URL} from 'node:url';


const route_templates = [
  '/exp/:version/:root/:view/:tag/:kind/:ref/:row',
];

const parsers     = route_templates.map(makePathPattern);
const pathParser  = makePathParser<ExPath>('ExPath', parsers);
const pathBuilder = makePathBuilder<ExPath>('ExPath', parsers);


export type ExPath = {
  version: str;
  root   : str;
  view   : str;
  kind   : str;
  ref    : str;
  tag    : str;
  row    : num;
};


const empty = (): ExPath => ({
  version: NONE,
  root   : NONE,
  view   : NONE,
  kind   : NONE,
  ref    : NONE,
  tag    : NONE,
  row    : NONE_NUM,
});

export const ExPath = {
  parse: (url: URL) => {
    if (url.pathname === '/') {
      return empty();
    }

    const route = pathParser(url.pathname);

    route.row = parseInt(route.row as unknown as str);

    return route;
  },
  build: (route: ExPath) => {
    const base = empty();

    base.row  = route.row.toString() as unknown as num;
    route.row = route.row.toString() as unknown as num;

    return pathBuilder({
      ...base,
      ...route,
    });
  },
  set    : setParam<ExPath>,
  setWith: setParamWith<ExPath>,
  map    : mapParam<ExPath>,
  empty  : empty,
};
