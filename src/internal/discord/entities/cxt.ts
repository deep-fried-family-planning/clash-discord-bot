import {Cx} from '#dfdis';
import {DeveloperError} from '#discord/errors/developer-error.ts';
import {TypeC} from '#pure/dfx';
import {Ar, p} from '#pure/effect';
import type {Component} from 'dfx/types';


const makeRest = Cx.C.$match({
    Button : ({data}) => data,
    Link   : ({data: {custom_id, ...data}}) => data,
    Select : ({data}) => data,
    User   : ({data}) => data,
    Role   : ({data}) => data,
    Channel: ({data}) => data,
    Mention: ({data}) => data,
    Text   : ({data}) => data,
});


export const makeGrid = (cxs: Cx.T[][]) => p(cxs, Ar.map((cxs, row) => ({
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
                row: `${row}`,
                col: `${col}`,
            }),
            Cx.buildId,
            makeRest,
        );
    })),
}))) as unknown as Component[];
