import {Driver, Routing, Slice, View, Protocol} from '../system';
import type {CxKey} from '#src/internal/ix-system/id/routes-keys.ts';
import {CxRoutes} from '#src/internal/ix-system/id/routes-keys.ts';
import {Modifiers} from '#src/internal/ix-system/enum/enums.ts';
import {E, g} from '#src/internal/pure/effect.ts';
import {Discord} from 'dfx';
import {Embed} from '#src/internal/ix-system/model/view.ts';
import {v3} from 'uuid';
import {UNAVAILABLE} from '#src/constants/select-options.ts';


export const v3_routing = Routing.make<typeof CxKey>(CxRoutes);


export const v3_slice = Slice.make({
    name: 'testing',
    spec: {
        test1: {
            alias   : '1',
            type    : Discord.ComponentType.BUTTON,
            protocol: Protocol.exJson.name,
        },
        test2: {
            alias   : '2',
            type    : Discord.ComponentType.STRING_SELECT,
            protocol: Protocol.exJson.name,
        },
    },
    init: () => E.succeed({
        test1: {
            label: '1',
        },
        test2: {
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


export const v3_view1 = View.make('testing1', () => {
    return [
        View.Embed({
            id         : Protocol.exJson.label,
            description: 'test embed',

        }),
        [
            View.Button({
                label  : 'ope',
                onClick: v3_slice.alias.test1,
                type   : Discord.ComponentType.BUTTON,
                style  : Discord.ButtonStyle.SUCCESS,
            }),
            View.Button({
                label  : 'ope2',
                onClick: v3_slice.alias.test1,
                type   : Discord.ComponentType.BUTTON,
                style  : Discord.ButtonStyle.PRIMARY,
            }),
        ],
        [
            View.Select({
                onClick: v3_slice.alias.test2,
                type   : Discord.ComponentType.STRING_SELECT,
                options: [{label: UNAVAILABLE, value: UNAVAILABLE}],
            }),
        ],
    ];
});


export const v3_view2 = View.make('testing2', () => {
    return [
        View.Embed({
            id         : 'test embed2',
            description: 'test embed2',
            author     : {
                url     : 'https://www.url.com',
                icon_url: 'https://',
            },
            footer: {
                icon_url: 'https://www.url.com',
            },
        }),
        [
            View.Button({
                view   : v3_view1.name,
                label  : 'ope',
                onClick: v3_slice.alias.test1,
                type   : Discord.ComponentType.BUTTON,
                style  : Discord.ButtonStyle.SECONDARY,
            }),
        ],
        [
            View.Select({
                onClick: v3_slice.alias.test2,
                type   : Discord.ComponentType.STRING_SELECT,
                options: [{label: UNAVAILABLE, value: UNAVAILABLE}],
            }),
        ],
    ];
});


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
