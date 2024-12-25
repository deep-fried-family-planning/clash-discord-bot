import {Cx, Driver, Slice, VxCx, VxTree} from '#dfdis';
import {implementation} from '#discord/implementation.ts';
import {defaultCxRouter, defaultExRouter} from '#discord/model-routing/ope.ts';
import {original} from '#src/discord/ixc-original.ts';
import type {IxD} from '#src/internal/discord.ts';
import {CSL, E, g, p} from '#src/internal/pure/effect.ts';


export const slice = Slice.make({
    name: 'vdomtest',
    spec: {
        thing1: {type: Cx.Tag.User},
        thing2: {type: Cx.Tag.Channel},
        test1 : {type: Cx.Tag.Select},
    },
    actions: {
        init   : (_, sc) => E.succeed(sc),
        setUser: (_, sc) => E.succeed({
            ...sc,
            thing1: {
                ...sc.thing1,
            },
        }),
        setChannel: (_, sc) => g(function * () {
            return sc;
        }),
    },
});

export const slice2 = Slice.make({
    name: 'test2',
    spec: {
        thing1: {type: Cx.Tag.User},
        thing2: {type: Cx.Tag.Channel},
    },
    actions: {
        init   : (_, sc) => E.succeed(sc),
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


export const root = VxTree.C.Root({
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
                                        root  : 'v3',
                                        view  : 'first',
                                        name  : 'vdomtest',
                                        data  : 'test1',
                                        action: 'test',
                                        row   : 'test',
                                        col   : 'test',
                                    },
                                }),
                            }),
                            VxCx.C.FunctionComponent({
                                name: 'second',
                                data: () => Cx.C.Channel({
                                    _data: '',
                                    _id  : {
                                        root  : 'v3',
                                        view  : root.name,
                                        name  : slice.data.thing2.slice,
                                        data  : slice.data.thing2.data,
                                        action: slice.ax.setChannel.action,
                                        row   : 'test',
                                        col   : 'test',
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


const modelDriver = Driver.make({
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

    return yield * implementation(driver, ix);
});


export const ixcRouter = (ix: IxD) => p(
    router(ix), // todo add "recoverable error"
);
