import {type V2Route, v2Router} from '#discord/model-routing/ope.ts';
import {p} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {ExV} from '..';
import {Const, CxV} from '..';


// export type ViewNode = {
//     Dialog : [{title: str; route: V2Route}, ...CxV.T[][]];
//     Message: [ExV.T[], ...CxV.T[][]];
// };


type TempDialog = {title: str; route: V2Route};


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

            const [first, ...restEmbeds] = rest.filter((r) => !Array.isArray(r)) as ExV.T[];
            const components             = rest.filter((r) => Array.isArray(r));
            const dialog                 = 'custom_id' in first ? first as unknown as TempDialog : {title: Const.NONE, route: v2Router.empty()};

            const route = {
                ...v2Router.empty(),
                ...dialog.route,
            };

            return {
                dialog: {
                    ...dialog,
                    route: p(
                        route,
                        v2Router.set('root', root),
                        v2Router.set('view', viewname ?? name),
                        v2Router.set('dialog', name),
                    ),
                },
                embeds: 'custom_id' in first ? [] : [
                    (({_tag, ...data}) => data)(first),
                    ...restEmbeds.map(({_tag, ...exv}) => exv),
                ],
                components: components.map((r, row) => r.map((c, col) => {
                    return p(
                        CxV.make(c, {
                            ...v2Router.empty(),
                            root  : root,
                            view  : viewname ?? name,
                            dialog: name,
                            row   : `${row}`,
                            col   : `${col}`,
                        }),
                    );
                })),
            };
        },
    };
};
