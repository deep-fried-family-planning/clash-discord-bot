import {makePathBuilder, makePathParser, makePathPattern, mapParam, setParam, setParamWith} from '#discord/routing/template-path.ts';
import {NONE, NONE_NUM} from '#discord/utils/constants.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';


const route_templates = [
  '/exp/:version/:driver/:node/:embed/:row',
];

const parsers = route_templates.map(makePathPattern);

export type ExPath = {
  version: str;
  driver : str;
  node   : str;
  tag    : str;
  row    : num;
};

export const ExPath = {
  parse: makePathParser<ExPath>('ExPath', parsers),
  build: makePathBuilder<ExPath>('ExPath', parsers),
  empty: (): ExPath => ({
    version: NONE,
    driver : NONE,
    node   : NONE,
    tag    : NONE,
    row    : NONE_NUM,
  }),
  set    : setParam<ExPath>,
  setWith: setParamWith<ExPath>,
  map    : mapParam<ExPath>,
};
