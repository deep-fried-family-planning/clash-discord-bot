import {p} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {ExV} from '..';
import {Const, CxV} from '..';


export type View = () =>
  | readonly [{title: str; custom_id: str}, ...CxV.T[][]]
  | readonly [ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ExV.T, ExV.T, ...CxV.T[][]]
  | readonly [ExV.T, ExV.T, ExV.T, ExV.T, ExV.T, ExV.T, ...CxV.T[][]];


export const makeView = (name: str, view: View) => {
  return {
    name,
    view: (root: str) => {
      const output = view();

      const [...rest] = output;

      const [first, ...restEmbeds] = rest.filter((r) => !Array.isArray(r)) as ExV.T[];
      const components             = rest.filter((r) => Array.isArray(r));

      return {
        dialog: 'custom_id' in first ? first : {title: Const.NONE, custom_id: Const.NONE},
        embeds: 'custom_id' in first ? [] : [
          (({_tag, ...data}) => data)(first),
          ...restEmbeds.map(({_tag, ...exv}) => exv),
        ],
        components: components.map((r, row) => r.map((c, col) => {
          return p(
            CxV.make(c, {
              root: root,
              view: name,
              row : `${row}`,
              col : `${col}`,
            }),
          );
        })),
      };
    },
  };
};
