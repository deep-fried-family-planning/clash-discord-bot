import {Driver, Routing, Slice, Vx, Ex, Cx} from '#src/internal/ix-v2/model/system.ts';
import type {CxKey} from '#src/internal/ix-v2/id/routes-keys.ts';
import {CxRoutes} from '#src/internal/ix-v2/id/routes-keys.ts';
import {Modifiers} from '#src/internal/ix-v2/model/enum/enums.ts';
import {E, g} from '#src/internal/pure/effect.ts';
import {Discord} from 'dfx';
import {UNAVAILABLE} from '#src/constants/select-options.ts';


export const v3_routing = Routing.make<typeof CxKey>(CxRoutes);


export const v3_slice = Slice.make({
    name: 'testing',
    spec: {
        test1: {
            alias: '1',
            type : Cx.Cx.Button,
        },
        test2: {
            alias: '2',
            type : Cx.Cx.String,
        },
    },
    init: (si, sc, ax) => E.succeed({
        test1: {
            ...sc.test1,
            label: '1',
        },
        test2: {
            ...sc.test2,
            placeholder: 'Ope',
        },
    }),
    actions: {
        test1: (si, sc, ax) => {
            return E.succeed({
                ...sc,
                test1: {
                    label: 'ope2',
                },
            });
        },
        test2: (si, sc, ax) => {
            return E.succeed(sc);
        },
    },
});


export const v3_view1 = Vx.Enum.Modal({name: 'testing1', view: () => {
    return [
        Ex.Ex.Basic({
            meta: {

            },
            title: UNAVAILABLE,
        }),
        Ex.Ex.Editor({
            _meta: {
                name: 'testing',
            },
            description: 'test embed',
        }),
        [
            Cx.Cx.Button({
                _meta: {
                    id     : {},
                    onClick: v3_slice.spec.test1,
                },
                label: 'ope',
                type : Discord.ComponentType.BUTTON,
                style: Discord.ButtonStyle.SUCCESS,
            }),
            Cx.Cx.Button({
                _meta: {
                    id     : {},
                    onClick: v3_slice.spec.test2,
                },
                label: 'ope2',
                type : Discord.ComponentType.BUTTON,
                style: Discord.ButtonStyle.PRIMARY,
            }),
        ],
        [
            Cx.Cx.String({
                _meta: {
                    id     : {},
                    onClick: v3_slice.spec.test2,
                },
                type   : Discord.ComponentType.STRING_SELECT,
                options: [{label: UNAVAILABLE, value: UNAVAILABLE}],
            }),
        ],
    ];
}});


export const v3_driver = Driver.make({
    name      : 'v3',
    routing   : v3_routing,
    predicates: {
        action: (id) => `${id.slice}/${id.action}`,
        view  : (id) => id.view,
        cmode : 'cmode',
        ctype : 'ctype',
        entry : (id) => id.modifiers === Modifiers.ENTRY,
        delete: (id) => id.modifiers === Modifiers.DELETE,
        slice : 'slice',
    },
    initialize: (ix) => g(function * () {
        return {

        };
    }),
    slices: [
        v3_slice,
    ],
    views: [
        v3_view1,
    ],
    components: [],
    entry     : '',
});
