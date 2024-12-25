import type {Driver} from '#dfdis';
import {Ax, Cx, CxVR, Flags, Rx, Sx, VxTree} from '#dfdis';
import {RenderError} from '#discord/errors/render-error.ts';
import {defaultCxRouter} from '#discord/model-routing/ope.ts';
import type {IxIn} from '#discord/utils/types.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {IxD} from '#src/internal/discord.ts';
import {Ar, g, Kv, pipe} from '#src/internal/pure/effect.ts';
import {UI} from 'dfx';


export const implementation = <
    A extends ReturnType<typeof Driver.make>,
>(
    driver: A,
    anyIx: IxD,
) => g(function * () {
    const ix = anyIx as IxIn;

    const {rx, sx, ax} = pipe(Ax.make(ix), Sx.mergeSxAx(Rx.make(ix)));
    const scp = pipe(sx, Kv.filter((v) => v._id!.name === ax._id.name));

    if (ax._tag === 'Close') {
        return yield * DiscordApi.deleteOriginalInteractionResponse(ix.application_id, ix.token);
    }
    if (!(ax._id.view in driver.nodes)) {
        return yield * new RenderError({});
    }

    let scn = {};

    if (ax._flags.includes(Flags.Id.Action)) {
        const slice = driver.slices[ax._id.name!];
        const action = slice.reducers[ax._id.action!];
        const data = driver.slices[ax._id.name!].data;

        const scp_aliased = pipe(scp, Kv.mapEntries((v) => {
            const spec = data[v._id!.data!];
            return [spec.data, v];
        }));

        const scn_aliased = yield * action({}, scp_aliased);

        scn = pipe(scn_aliased, Kv.mapEntries((v, k) => {
            const spec = data[k];
            return [CxVR.data(spec.slice, spec.data), Cx.C[spec.type](v as never)];
        }));
    }

    const view = driver.nodes[ax._id.view];

    const vx = VxTree.make(view);

    yield * DiscordApi.editMenu(ix, {
        components: UI.grid([
            ...pipe(vx.cx, Kv.toEntries, Ar.map(([, cx]) => pipe(cx, Cx.map((cx) => ({...cx, custom_id: defaultCxRouter.build(cx._id)}))))),
        ]),
    });
});
