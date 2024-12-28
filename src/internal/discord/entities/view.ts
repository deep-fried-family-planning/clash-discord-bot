import {CxPath} from '#discord/routing/cx-path.ts';
import {NONE} from '#discord/utils/constants.ts';
import {Ar, p} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Const, CxV, ExV} from '..';


// export type ViewNode = {
//     Dialog : [{title: str; route: V2Route}, ...CxV.T[][]];
//     Message: [ExV.T[], ...CxV.T[][]];
// };


type TempDialog = {
  title    : str;
  route    : CxPath;
  onSubmit?: () => void;
  onOpen?  : () => void;
};


export type SimulatedView = ReturnType<ReturnType<typeof makeView>['view']>;


export type View = () =>
  | readonly [TempDialog, ...CxV.T[][]]
  | readonly [ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ExV.T, ExV.T, ExV.T, ...CxV.T[][]];


export const makeView = (name: str, view: View) => {
  return {
    name,
    view: (root: str, viewname?: str) => {
      const output = view();

      const [...rest] = output;

      const [first, ...restEmbeds] = rest.filter((r) => !Array.isArray(r));
      const components             = rest.filter((r) => Array.isArray(r));
      const dialog                 = 'route' in first ? first : {title: Const.NONE, route: CxPath.empty()};

      const route = {
        ...CxPath.empty(),
        ...dialog.route,
      };

      return {
        dialog: {
          ...dialog,
          route: p(
            route,
            CxPath.set('root', root),
            CxPath.set('view', viewname ?? name),
            CxPath.set('dialog', name),
          ),
        },
        embeds    : 'route' in first ? [] : p([first, ...restEmbeds] as ExV.T[], Ar.map((exv) => ExV.make(exv))),
        components: components.map((r, row) => r.map((c, col) => {
          return p(
            CxV.make(c, {
              ...CxPath.empty(),
              root    : root,
              view    : viewname ?? name,
              dialog  : name,
              accessor: c.accessor ?? NONE,
              row     : row,
              col     : col,
            }),
          );
        })),
      };
    },
  };
};
