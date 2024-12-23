import type {Driver} from '#src/internal/ix-v2/model/system.ts';
import {Slice, Cx, Ex, Vx} from '#src/internal/ix-v2/model/system.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Ar, E, g, Kv, p} from '#src/internal/pure/effect.ts';
import type {IxIn} from '#src/internal/ix-v2/model/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {map2d, mapDx, mapIx} from '#src/internal/ix-v2/model/utils.ts';
import {Option} from 'effect';
import {UI} from 'dfx';


export const runner = (
    driver: ReturnType<typeof Driver.make>,
    any_ix: IxD,
) => g(function * () {
    const ix = any_ix as IxIn;

    const {
        routing,
        predicates: px,
    } = driver;

    const axr = routing.parse(ix.data.custom_id);

    if (px.delete(axr)) {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }

    // next steps
    // -> fix implicit selections on select components
    //
    // reach:
    // -> simulate the dom tree system
    // -> pipe thru props for entire dom tree
    // -> render -> current view is searched/found and sent back as Tx

    const rx_ex = p(ix.message.embeds, Ar.map((ex) => Ex.fromRx(ex)));

    const rx_cx = p(ix, mapIx((c, row, col) => p(
        Cx.fromRx(c),
        Cx.updateMeta({
            id: p(
                routing.parse(c.custom_id!),
                routing.set('row', row),
                routing.set('col', col),
            ),
        })),
    ));

    const ax_dx = p(ix, mapDx((c, row, col) => p(
        Cx.fromRx(c),
        Cx.updateMeta({
            id: p(
                routing.parse(c.custom_id!),
                routing.set('row', `${row}`),
                routing.set('col', `${col}`),
            ),
        }),
    )));


    const sx_cx = p(
        rx_cx,
        Ar.appendAll(ax_dx),
        Ar.flatten,
        Kv.fromIterableWith((c) => [px.action(c._meta.id), c]),
    );

    const [sx_dismount, sx_mount] = p(
        rx_ex,
        Ar.filter((ex) => !!ex._meta.protocol),
        Ar.flatMap((ex) => p(
            Ex.resolveMap(ex, {}),
            Ex.decode,
            Kv.toEntries,
        )),
        Ar.partition(([k]) => k in sx_cx),
        Ar.map((cx) => Kv.fromEntries(cx)),
    );


    const si = yield * driver.initialize(ix);


    const ax = p(
        rx_cx,
        Ar.flatten,
        Ar.findFirst((c) => c.custom_id === ix.data.custom_id),
        Option.map((c) => p(c, Cx.setSelected(...'values' in ix.data ? (ix.data.values as unknown as str[]) : []))),
    );

    const sx = p(
        sx_cx,
        Kv.mapEntries((v, k) => {
            if (k in sx_mount) {
                return [k, p(v, Cx.setSelected(...Cx.getSelected(sx_mount[k])))];
            }
            return [k, v];
        }),
        Kv.toEntries,
        Ar.appendAll(Kv.toEntries(sx_dismount)),
        Kv.fromEntries,
        (cx) => {
            if (Option.isSome(ax)) {
                cx[px.action(ax.value._meta.id)] = ax.value;
            }
            return cx;
        },
    );


    const axp = px.action(axr);
    const slice = driver.slices[axr[px.slice]];

    const sn = !(axp in driver.reducers) || !(axr[px.slice] in driver.slices)
        ? {}
        : yield * p(
            driver.reducers[axp].reducer(
                si,
                p(slice.kv, Kv.mapEntries((v, k) => [v.name, sx[k]])),
                sx[axp],
            ),
            E.map((aliased) => p(aliased, Kv.mapEntries((v, k) => [Slice.predicate(slice.name, k), slice.spec[k].type(v as never)]))),
        );

    const nextState = p(
        sn,
        Kv.partition((_, k) => k in sx),
        ([dismount, mount]) => ({
            ...sx,
            ...p(mount, Kv.mapEntries((v, k) => [k, p(sx[k], Cx.setSelected(...Cx.getSelected(v)))])),
            ...dismount,
        }),
    );

    if (!(px.view(axr) in driver.views)) {
        return yield * DiscordApi.editMenu(ix, {
            embeds    : ix.message.embeds,
            components: ix.message.components,
        });
    }

    const view = driver.views[px.view(axr)];
    const vx = view(si, nextState, nextState[axp]);

    const tx_ex = p(
        vx,
        Vx.getEx,
        Ar.map((ex) => p(
            ex,
            Ex.attachUrl,
            Ex.encode(sx),
            Ex.toTx,
        )),
    );

    const tx_cx = p(
        vx,
        Vx.getCx,
        map2d((cx, row, col) => p(
            cx,
            (noice) => Cx.merge(sx[px.action(noice._meta.id)])(noice),
            Cx.updateMeta({
                id: {
                    [px.slice]: cx._meta.onClick?.slice ?? 'none',
                    action    : cx._meta.onClick?.name ?? 'none',
                    ctype     : 'test',
                    cmode     : 'test',
                    row       : row.toString(),
                    col       : col.toString(),
                    view      : cx._meta.id.view ? cx._meta.id.view : px.view(axr),
                    modifiers : cx._meta.id.modifiers ? cx._meta.id.modifiers : 'none',
                },
            }),
            Cx.map((c) => p(c, Cx.setCustomId(routing.build(c._meta.id)))),
            Cx.toTx,
        )),
    );

    // inject any state with active protocols into designated tx.ex deduced by View
    // process predicate modifiers
    //   -> confirm delete -> disable all except back/close
    //   -> delete -> keep disabled, enable "another" button

    return yield * DiscordApi.editMenu(ix, {
        embeds    : tx_ex,
        components: UI.grid(tx_cx),
    });
});
