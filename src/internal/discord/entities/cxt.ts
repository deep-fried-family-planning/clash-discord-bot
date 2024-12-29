import {Cx} from '#dfdis';
import type {CxPath} from '#discord/entities/cx-path.ts';
import {updateRxRefs} from '#discord/hooks/use-rest-ref.ts';
import {DeveloperError} from '#discord/z-errors/developer-error.ts';
import {type RestDataComponent, type RestDataDialog, type RestDataResolved, TypeC} from '#pure/dfx';
import {Ar, p} from '#pure/effect';
import type {nopt, str} from '#src/internal/pure/types-pure.ts';
import type {Component} from 'dfx/types';


export const makeGrid = (
  vxcx: Cx.Type[][],
  data: RestDataDialog | RestDataComponent,
  ax: CxPath,
  rx?: Cx.Type[][],
) => {
  const txcx = rx
    ? updateRxRefs(vxcx, rx)
    : vxcx;


  return p(txcx, Ar.map((cxs, row) => ({
    type      : TypeC.ACTION_ROW,
    components: p(cxs, Ar.map((cx, col) => {
      if (row > 5) {
        throw new DeveloperError({
          message: 'No more than 5 rows allowed',
        });
      }
      if (col > 5) {
        throw new DeveloperError({
          message: 'No more than 5 columns allowed',
        });
      }

      return p(
        cx,
        Cx.set('route', {
          ...cx.route,
          row: row,
          col: col,
        }),
        Cx.buildId,
        row === ax.row && col === ax.col
          ? Cx.setSelectedOptions(
            'values' in data ? data.values as unknown as str[] : [],
            'resolved' in data ? data.resolved as nopt<RestDataResolved> : undefined,
          )
          : Cx.pure,
        Cx.encode,
      );
    })),
  }))) as unknown as Component[];
};
