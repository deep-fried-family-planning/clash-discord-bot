import {Ar, CSL, E, Kv, ORD, ORDS, p, pipe} from '#src/internal/pure/effect.ts';
import type {IxDc} from '#src/internal/discord.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {DriverError} from '#src/ix/store/make-driver.ts';
import type {ActionRow, Button, Embed, SelectMenu, TextInput} from 'dfx/types';
import {original} from '#src/discord/ixc-original.ts';
import {v2_driver} from '#src/ix/drivers/v2/v2.ts';
import {Discord, UI} from 'dfx';
import type {TxCx} from '#src/ix/store/make-component.ts';
import {inspect} from 'node:util';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {CxId} from '#src/ix/id/cx-id.ts';
import {RK_ENTRY} from '#src/constants/route-kind.ts';


type Cx = {[k in str]: {params: Record<str, str>; c: Button | SelectMenu}};
type Dx = {[k in str]: {params: Record<str, str>; c: TextInput}};


const drivers = [
    v2_driver,
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

    const driver = drivers.find((driver) => data.custom_id.startsWith(driver.name));


    if (!driver) {
        yield * CSL.debug('no driver');
        return yield * original(ix);
    }

    const {
        routing,
        predicates,

    } = driver;


    yield * CSL.debug('driver found', driver.sliceStates);

    const ax = routing.parse((ix.data as IxDc).custom_id);

    if (predicates.delete(ax)) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    const modalData = 'components' in data ? data.components : [];


    const rx = {
        ex: p(
            ix.message.embeds,
            Ar.filter((e) => !!e.author?.name),
            Kv.fromIterableWith((e) => [e.author!.name, e] as const),
        ),
        cx: pipe(
            ix.message.components as ActionRow[],
            Ar.flatMap((r, rdx) => p(
                r.components as (Button | SelectMenu | TextInput)[],
                Ar.filter((c) => !!c.custom_id?.startsWith(driver.name)),
                Ar.map((c, cdx) => ({
                    id: p(
                        routing.parse(c.custom_id!),
                        routing.set('row', rdx),
                        routing.set('col', cdx),
                    ),
                    c: c,
                })),
            )),
            Kv.fromIterableWith((c) => [predicates.action(c.id), c]),
        ),
        dx: pipe(
            modalData as ActionRow[],
            Ar.map((r, rdx) => p(
                r.components as (TextInput)[],
                Ar.filter((c) => !!c.custom_id.startsWith(driver.name)),
                Ar.map((c, cdx) => ({
                    id: p(
                        routing.parse(c.custom_id),
                        routing.set('row', rdx),
                        routing.set('col', cdx),
                    ),
                    c: c,
                })),
            )),
            Ar.flatten,
            Kv.fromIterableWith((c) => [predicates.action(c.id), c]),
        ),
    };

    yield * CSL.debug('rx', rx);

    const ax_p = predicates.action(ax);

    yield * CSL.debug('ax_p', ax_p);

    // state
    const initialState = yield * driver.initialize(ix);

    yield * CSL.debug('initialState', initialState);

    const sliceRefs = predicates.action(ax) in driver.sliceStates
        ? driver.sliceStates[ax_p].sx
        : {};

    yield * CSL.debug('sliceRefs', sliceRefs);

    const sliceState = p(
        sliceRefs,
        Kv.mapEntries((v, k) => [k, rx.cx[k]] as const),
    );

    yield * CSL.debug('sliceState', sliceState);

    if (!(predicates.action(ax) in driver.reducers)) {
        return yield * new DriverError({
            message: 'Unrecognized Interaction',
        });
    }

    const sn = yield * driver.reducers[ax_p](initialState, sliceState, ax);

    yield * CSL.debug('sn', sn);

    // view
    const viewKey = predicates.view(ax);


    yield * CSL.debug('viewKey', viewKey);

    if (!(viewKey in driver.views)) {
        return yield * new DriverError({
            message: 'Bad Implementation',
        });
    }

    const view = driver.views[viewKey](sn);

    const components = p(
        view,
        Ar.filter((v) => Ar.isArray(v)),
        Ar.map((r, row) => p(
            (r as unknown as TxCx[]),
            Ar.map((cx, col) => {
                const {onClick, ...c} = cx.rest;

                if (!(onClick in rx.cx)) {
                    const [slice, action] = onClick.split('/');

                    return {
                        ...cx.config.base,
                        ...c,
                        type     : cx.config.type,
                        custom_id: routing.build({
                            origin            : 'test',
                            slice             : slice,
                            action            : action,
                            [predicates.ctype]: cx.config.name,
                            [predicates.cmode]: cx.config.init ?? 'base',
                            row               : `${row}`,
                            col               : `${col}`,
                            view              : ax.view,
                            modifiers         : 'NONE',
                        }),
                        disabled: false,
                    };
                }

                if (onClick === ax_p) {
                    const restId = rx.cx[onClick].id;
                    const ctype = restId[predicates.ctype];
                    const cmode = restId[predicates.cmode];
                    const {next, rest} = cx.config.modes?.[cmode]?.() ?? {next: cmode};


                    const id = routing.build({
                        ...restId,
                        [predicates.ctype]: ctype,
                        [predicates.cmode]: next,
                        row               : `${row}`,
                        col               : `${col}`,
                        view              : ax.view,
                        modifiers         : 'NONE',
                    });

                    return {
                        ...cx.config.base,
                        ...rx.cx[onClick].c,
                        ...c,
                        ...rest,
                        type     : cx.config.type,
                        custom_id: id,

                        disabled: false,
                    };
                }

                return {
                    ...rx.cx[onClick].c,
                    disabled: false,
                };
            }),
        )),
    );

    return yield * DiscordApi.editMenu(ix, {
        embeds    : view.filter((e) => !Ar.isArray(e)) as Embed[],
        components: UI.grid(components),
    });
}).pipe(
    E.catchTag('DriverError', (e) => E.gen(function * () {
        const embeds = ix.message?.embeds;

        const ex = p(
            ix.message!.embeds,
            Ar.filter((e) => !!e.author?.name),
            Kv.fromIterableWith((e) => [e.author!.name, e] as const),
        );

        ex['ohshit'] = {
            author: {
                name: 'ohshit',
            },
            title      : `Recoverable Error: ${e.message}`,
            description: 'Ya dun goofed, click restart',
            color      : nColor(COLOR.ERROR),
        };

        const em = p(
            ex,
            Ar.fromRecord,
            Ar.sortBy(
                ORD.mapInput(ORDS, ([,embed]) => embed.author?.name ?? ''),
            ),
            Ar.map(([, embed]) => embed),
        );


        yield * DiscordApi.editMenu(ix, {
            embeds: [
                ...embeds,
                {
                    author: {
                        name: 'ohshit',
                    },
                    title      : `Recoverable Error: ${e.message}`,
                    description: 'Ya dun goofed, click restart from last UI state',
                    color      : nColor(COLOR.ERROR),
                },
            ],
            components: UI.grid([
                ...p(
                    ix.message!.components,
                    Ar.map((cs) => p(cs.components, Ar.map((c) => ({
                        ...c,
                        disabled: true,
                    })))),
                ),
                [
                    UI.button({
                        style    : Discord.ButtonStyle.SUCCESS,
                        custom_id: CxId.build({
                            origin   : 'test',
                            slice    : 'test',
                            action   : 'test',
                            ctype    : 'test',
                            cmode    : 'test',
                            row      : 'test',
                            col      : 'test',
                            view     : 'test',
                            modifiers: RK_ENTRY,
                        }),
                        label: 'Recover',
                    }),
                ],
            ]),
        });
    })),
);


export const ixcRouter = (ix: IxD) => p(
    router(ix), // todo add "recoverable error"
);

