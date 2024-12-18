import {Cx, Slice, View, type Driver, Protocol} from '#src/internal/ix-system/model/system.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {Ar, E, g, Kv, p, Sr} from '#src/internal/pure/effect.ts';
import {UI} from 'dfx';
import type {IxIn, RestButton, RestSelect, RestText} from '#src/internal/ix-system/model/types.ts';
import {logThru} from '#src/internal/ix-system/model/utils.ts';


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

    const rx = {
        ex: p(
            ix.message.embeds,
            Ar.filter((e) => !!e.author?.name),
            Kv.fromIterableWith((e) => [e.author!.name, e] as const),
        ),
        cx: p(ix, Cx.mapIx((c, row, col) => ({
            id: p(
                routing.parse(c.custom_id!),
                routing.set('row', `${row}`),
                routing.set('col', `${col}`),
            ),
            rest: c,
        }))),
        dx: p(ix, Cx.mapDx((c, row, col) => ({
            id: p(
                routing.parse(c.custom_id!),
                routing.set('row', `${row}`),
                routing.set('col', `${col}`),
            ),
            rest: c,
        }))),
    };


    // find all protocols from rx.ex
    // unwrap protocols from rx.ex => sc/alias
    // inject protocol states into initial states
    //
    // -> detect "flush" predicate modifier, do not process protocols into state

    const scp = p(
        rx.ex,
        Kv.filter((v, k) => k in Protocol.standard.label),
        Kv.toEntries,
        Ar.flatMap(([k, v]) => p(
            Protocol.standard.label[k].decode(v),
            Kv.toEntries,
        )),
    );


    // fold ax rest into cx rest implicitly
    // process cx state level updates from [ctype, cmode]

    // map each component type to sc
    //   -> string select -> [type, ]

    // initial state
    const si = yield * driver.initialize(ix);

    const srx = p(
        rx.cx,
        Ar.appendAll(rx.dx),
        Ar.appendAll(scp),
        Kv.fromIterableWith((c) => {
            if ('id' in c) {
                return [px.action(c.id), c.rest];
            }
            return c;
        }),
    ); // todo fixme

    // reduce
    const axp = px.action(axr);
    const slice = driver.slices[axr[px.slice]];

    const sn = !(axp in driver.reducers) || !(axr[px.slice] in driver.slices)
        ? {}
        : yield * p(
            driver.reducers[axp].reducer(
                si,
                p(slice.kv, Kv.mapEntries((v, k) => [v.name, srx[k]])),
                srx[axp],
            ),
            E.map((aliased) => p(aliased, Kv.mapKeys((k) => Slice.predicate(slice.name, k)))),
        );


    const st = {
        ...srx,
        ...sn,
    };


    if (!(px.view(axr) in driver.views)) {
        return yield * DiscordApi.editMenu(ix, {
            embeds    : ix.message.embeds,
            components: ix.message.components,
        });
    }

    const view = driver.views[px.view(axr)](si, sn, srx[axp]);


    const tx = {
        ex: p(view, View.mapEmbeds(({id, ...rest}) => {
            if (id in Protocol.standard.label) {
                const protocol = Protocol.standard.label[id];


                return {
                    id,
                    rest: protocol.encode(rest, p(st, Kv.filter((v, k) => {
                        const [slice, action] = k.split('/');

                        const slc = driver.slices[slice];

                        const slcalias = p(
                            slc.alias,
                            Kv.toEntries,
                            Kv.fromEntries,
                            Kv.mapEntries((v, k) => [Slice.predicate(v.slice, v.alias), slc.spec[k]]),
                        );

                        console.log(protocol);
                        console.log(v, k, slcalias);

                        return k in slcalias && !!slcalias[k] && slcalias[k].protocol === protocol.name;
                    }))),
                };
            }

            return {
                id,
                rest,
            };
        })),
        cx: p(view, View.mapComponents((c, row, col) => {
            const {
                onClick,
                view: nextView,
                modifiers,
                ...rest
            } = c;

            const id = {
                [px.slice]: onClick.slice,
                action    : onClick.alias,
                ctype     : 'test',
                cmode     : 'test',
                row       : `${row}`,
                col       : `${col}`,
                view      : nextView ?? px.view(axr),
                modifiers : modifiers ?? 'none',
            };

            const predicate = Slice.predicate(id[px.slice], id.action);


            // detect willMount - inject any state with protocols into tx.cx

            const willMount = !p(sc, Kv.has(predicate));

            // const spec = driver.slices[px.slice].spec[id.action];


            const {id: no, ...backRest} = { // find out where {id: num} is coming from
                ...sc[px.action(id)],
                ...rest,
                // ...fromProtocol,
                ...sn[px.action(id)],
                custom_id: routing.build(id),
            };


            return {
                rest: backRest,
            };
        })),
    };


    // inject any state with active protocols into designated tx.ex deduced by View
    // process predicate modifiers
    //   -> confirm delete -> disable all except back/close
    //   -> delete -> keep disabled, enable "another" button

    return yield * DiscordApi.editMenu(ix, {
        embeds    : tx.ex.map((ex) => ex.rest),
        components: UI.grid(p(tx.cx, Cx.mapInner((c) => c.rest))),
    });
});
