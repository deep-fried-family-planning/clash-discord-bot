import {makePathBuilder, makePathParser, makePathPattern, mapParam, setParam, setParamWith} from '#discord/routing/template-path.ts';
import {NONE, NONE_NUM} from '#discord/utils/constants.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';


const route_templates = [
  '/cx/:root/:view/:dialog/:accessor/:row/:col/:mod',
];

const parsers = route_templates.map(makePathPattern);

const pathParser = makePathParser<CxPath>('CxPath', parsers);

export type CxPath = {
  root    : str;
  view    : str;
  dialog  : str;
  accessor: str;
  row     : num;
  col     : num;
  mod     : str;
};

export const CxPath = {
  parse: (id: str) => {
    const params = pathParser(id);

    params.row = parseInt(params.row as unknown as str);
    params.col = parseInt(params.col as unknown as str);

    return params;
  },
  build  : makePathBuilder<CxPath>('CxPath', parsers),
  set    : setParam<CxPath>,
  setWith: setParamWith<CxPath>,
  map    : mapParam<CxPath>,
  empty  : (): CxPath => ({
    root    : NONE,
    view    : NONE,
    dialog  : NONE,
    accessor: NONE,
    row     : NONE_NUM,
    col     : NONE_NUM,
    mod     : NONE,
  }),
};

// const cx = [
//   // fully stateful
//   '/v2/:root/:view/:row/:col/s/:name/:data/:action/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
//   '/v2/:root/:view/:row/:col/s/:name/:data/:action/c/:type/:mode/:mod?*',
//   '/v2/:root/:view/:row/:col/s/:name/:data/:action/:mod?*',
//
//   // stateful (data)
//   '/v2/:root/:view/:row/:col/sd/:name/:data/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
//   '/v2/:root/:view/:row/:col/sd/:name/:data/c/:type/:mode/:mod?*',
//   '/v2/:root/:view/:row/:col/sd/:name/:data/:mod?*',
//
//   // stateful (action)
//   '/v2/:root/:view/:row/:col/sa/:name/:action/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
//   '/v2/:root/:view/:row/:col/sa/:name/:action/c/:type/:mode/:mod?*',
//   '/v2/:root/:view/:row/:col/sa/:name/:action/:mod?*',
//
//   // not stateful
//   '/v2/:root/:view/:row/:col/c/:type/:mode/p/:p_group/:p_num/:p_now/:mod?*',
//   '/v2/:root/:view/:row/:col/p/:p_group/:p_num/:p_now/:mod?*',
//   '/v2/:root/:view/:row/:col/c/:type/:mode/:mod?*',
//   '/v2/:root/:view/:row/:col/:mod?*',
// ];
