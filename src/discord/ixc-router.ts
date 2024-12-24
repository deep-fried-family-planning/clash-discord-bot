import {CSL, E, p} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/internal/discord.ts';
import {original} from '#src/discord/ixc-original.ts';
import {Mdr, Sc, Cx, VxTree, VxCx} from '#src/internal/ix-v3/entities';
import {defaultCxRouter, defaultExRouter} from '#src/internal/ix-v3/routing';
import {implementation} from '#src/internal/ix-v3/implementation.ts';
import type {IxIn} from '#src/internal/ix-v2/model/types.ts';


const slice = Sc.make({
    name: 'vdomtest',
    spec: {
        thing1: {type: Cx.C.User},
        thing2: {type: Cx.C.Channel},
        test1 : {type: Cx.C.Channel},
        test2 : {type: Cx.C.Channel},
    },
    init   : (si: unknown, sc) => E.succeed(sc),
    actions: {
        setUser: (_, sc) => E.succeed({
            ...sc,
            thing1: {
                ...sc.thing1,
            },
        }),
        setChannel: (_, sc) => E.succeed({
            ...sc,
            thing2: {
                ...sc.thing2,
            },
        }),
    },
});

const slice2 = Sc.make({
    name: 'test2',
    spec: {
        thing1: {type: Cx.C.User},
        thing2: {type: Cx.C.Channel},
    },
    init   : (si: unknown, sc) => E.succeed(sc),
    actions: {
        setUser: (si, sc) => E.succeed({
            ...sc,
            thing1: {
                ...sc.thing1,
            },
        }),
        setChannel: (si, sc) => E.succeed({
            ...sc,
            thing2: {
                ...sc.thing2,
            },
        }),
    },
});


const root = VxTree.C.Root({
    name : 'root',
    label: 'Root',
    fn   : () => {
        return [
            VxCx.FrameC.ComponentFrame({
                data: [
                    VxCx.RowC.ComponentRow({
                        row : 0,
                        data: [
                            VxCx.C.FunctionComponent({
                                name: 'first',
                                data: () => Cx.C.User({
                                    _data: '',
                                    _id  : {
                                        root          : '',
                                        sc_name       : '',
                                        sc_data       : '',
                                        sc_action     : '',
                                        component_name: '',
                                        component_mode: '',
                                        view_name     : '',
                                        view_type     : '',
                                        page_port     : '',
                                        page_static   : '',
                                        page_current  : '',
                                        row           : '',
                                        col           : '',
                                    },
                                }),
                            }),
                        ],
                    }),
                ],
            }),
        ];
    },
});


const modelDriver = Mdr.make({
    name      : 'v3',
    root      : root,
    routing_cx: defaultCxRouter,
    routing_ex: defaultExRouter,
    slices    : [
        slice,
        slice2,
    ],
});


const drivers = [
    modelDriver,
];


const router = (ix: IxD) => E.gen(function * () {
    const data = ix.data;

    yield * CSL.debug('data', data);

    if (!data) {
        yield * CSL.debug('no data');
        return;
    }
    if (!('custom_id' in data)) {
        yield * CSL.debug('no custom_id');
        return;
    }
    if (!('message' in ix)) {
        yield * CSL.debug('no message');
        return;
    }

    const driver = drivers.find((driver) => data.custom_id.startsWith(`/${driver.name}`));


    if (!driver) {
        yield * CSL.debug('no driver');
        return yield * original(ix);
    }


    yield * CSL.debug('driver found', driver);

    return yield * implementation(driver, ix as IxIn);

    // return yield * runner(driver, ix);
});


export const ixcRouter = (ix: IxD) => p(
    router(ix), // todo add "recoverable error"
);

