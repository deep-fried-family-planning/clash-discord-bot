import {Rx, Ux, Nx, type Mdr, Ax, Sx, CxVi, VxTree} from './entities';
import type {IxIn} from '#src/internal/ix-v2/model/types.ts';
import {Ar, g, Kv, pipe} from '#src/internal/pure/effect.ts';
import {inspect} from 'node:util';
import type {ny} from '#src/internal/pure/types-pure.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const implementation = <
    A extends ReturnType<typeof Mdr.make>,
>(
    driver: A,
    ix: IxIn,
) => g(function * () {
    const nx = Nx.empty();

    const {rx, sx, ax} = pipe(Ax.make(ix), Sx.mergeSxAx(Rx.make(ix)));

    const scp = pipe(sx, Kv.filter((v) => v._id.name === ax._id.name));

    let scn = {};

    if (ax._id.name in driver.slices && ax._id.action in driver.slices[ax._id.name].actions) {
        const slice = driver.slices[ax._id.name];
        const action = slice.actions[ax._id.action];
        const data = driver.slices[ax._id.name].data;

        const scp_aliased = pipe(scp, Kv.mapEntries((v, k) => {
            const spec = data[v._id.data];

            return [spec.data, v];
        }));

        const scn_aliased = yield * action.reducer({}, scp_aliased);

        scn = pipe(scn_aliased, Kv.mapEntries((v, k) => {
            const spec = data[k];

            return [CxVi.data({name: spec.slice, data: spec.data} as ny), spec.type(v as ny)];
        }));
    }

    if (!(ax._id.view in driver.nodes)) {
        return yield * DiscordApi.editMenu(ix, {
            embeds    : ix.message.embeds,
            components: ix.message.components,
        });
    }

    const view = driver.nodes[ax._id.view];

    const vx = VxTree.make(view);


    pipe(rx.cx, Kv.map((c) => pipe(nx, Nx.set(c._data!, Ux.C.Rx({data: c})))));
    pipe(sx, Kv.map((c) => pipe(nx, Nx.set(c._data!, Ux.C.Rx({data: c})))));
    pipe(sx, Kv.map((c) => pipe(nx, Nx.set(c._data!, Ux.C.Ax({data: c})))));
    pipe(scp, Kv.mapEntries((v, k) => [k, pipe(nx, Nx.set(k, Ux.C.Sc_prev({data: v})))]));
    pipe(scn, Kv.mapEntries((v, k) => [k, pipe(nx, Nx.set(k, Ux.C.Sc_next({data: v})))]));


    console.log(vx);
});
