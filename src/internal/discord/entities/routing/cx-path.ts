import {NONE, NONE_NUM} from '#discord/entities/constants/constants.ts';
import {makePathBuilder, makePathParser, makePathPattern, mapParam, setParam, setParamWith} from '#discord/entities/routing/template-path.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';


const route_templates = [
  '/cx/:root/:view/:dialog/:accessor/:row/:col/:mod',
];

const parsers = route_templates.map(makePathPattern);


const pathParser  = makePathParser<CxPath>('CxPath', parsers);
const pathBuilder = makePathBuilder<CxPath>('CxPath', parsers);


export type CxPath = {
  root    : str;
  view    : str;
  dialog  : str;
  accessor: str;
  row     : num;
  col     : num;
  mod     : str;
};


const empty = (): CxPath => ({
  root    : NONE,
  view    : NONE,
  dialog  : NONE,
  accessor: NONE,
  row     : NONE_NUM,
  col     : NONE_NUM,
  mod     : NONE,
});


export const CxPath = {
  parse: (id: str) => {
    const params = pathParser(id);

    params.row = parseInt(params.row as unknown as str);
    params.col = parseInt(params.col as unknown as str);

    return params;
  },
  build: (route: CxPath) => {
    const base = empty();

    route.row = route.row.toString() as unknown as num;
    route.col = route.col.toString() as unknown as num;

    return pathBuilder({
      ...base,
      ...route,
    });
  },
  set    : setParam<CxPath>,
  setWith: setParamWith<CxPath>,
  map    : mapParam<CxPath>,
  empty  : empty,
};
