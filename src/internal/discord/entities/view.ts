import {NONE} from '#discord/entities/constants/constants.ts';
import {Ex, Vc} from '#discord/entities/index.ts';
import {CxPath} from '#discord/entities/routing/cx-path.ts';
import type {ViewNodeDialogOutput, ViewNodeMessageOutput} from '#discord/entities/types.ts';
import type {RestDataComponent, RestDataDialog} from '#pure/dfx';
import {Ar, p} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type SimulatedView = ReturnType<ReturnType<typeof makeView>['view']>;


export type View = () =>
  | ViewNodeDialogOutput
  | ViewNodeMessageOutput;


export const makeView = (name: str, view: View) => {
  return {
    name,
    view: (root: str, data: RestDataDialog | RestDataComponent, viewname?: str) => {
      const output = view();

      const [...rest] = output;

      const [first, ...restEmbeds] = rest.filter((r) => !Array.isArray(r));
      const components             = rest.filter((r) => Array.isArray(r));
      const dialog                 = 'route' in first ? first : {title: NONE, route: CxPath.empty()};

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
        embeds    : 'route' in first ? [] : p([first, ...restEmbeds] as Ex.Type[], Ar.map((exv) => Ex.make(exv))),
        components: components.map((r, row) => r.map((c, col) => {
          return p(
            Vc.make(c, {
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
