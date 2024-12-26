import type {Driver} from '#dfdis';
import {Const, Cx, CxVR, Flags} from '#dfdis';
import {makeGrid} from '#discord/entities-basic/cxt.ts';
import {DeveloperError} from '#discord/errors/developer-error.ts';
import {RenderError} from '#discord/errors/render-error.ts';
import {createHookContext, updateHookContext} from '#discord/hooks/context.ts';
import {cxRouter} from '#discord/model-routing/ope.ts';
import {isComponentIx, type IxIn} from '#discord/utils/types.ts';
import type {RestDataResolved, RestRow, RestStringSelect} from '#pure/dfx';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {snflk} from '#src/discord/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {Ar, CSL, E, g, Kv, p} from '#src/internal/pure/effect.ts';
import type {nopt, nro, str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {inspect} from 'node:util';


const parseCx = (rest: RestRow[]) => p(
    rest,
    Ar.flatMap((cs) => cs.components.map((c) => p(
        Cx.makeFromRest(c),
        Cx.set('route', cxRouter.parse((c as {custom_id: str}).custom_id)),
        Cx.resolveFlags,
    ))),
    Kv.fromIterableWith((cx) => [CxVR.makeAccessorFromVR(cx.route), cx]),
);


const resolveType = (resolved: nopt<RestDataResolved>, val: snflk) =>
    resolved.users?.[val] ? 'user'
        : resolved.roles?.[val] ? 'role'
            : resolved.channels?.[val] ? 'channel'
                : 'fail';


const parseIx = (ix: IxIn) => {
    const cxm       = parseCx(ix.message!.components as RestRow[]);
    const cxd       = parseCx('components' in ix.data ? ix.data.components as RestRow[] : []);
    const cx        = {...cxm, ...cxd};
    const data      = ix.data;
    const dataRoute = cxRouter.parse(ix.data.custom_id);

    let values   = [] as str[];
    let target   = {} as Cx.T;
    let resolved = {
        users   : {},
        roles   : {},
        channels: {},
    } as nopt<RestDataResolved>;

    if (isComponentIx(ix.data) && 'values' in data) {
        target = cx[CxVR.makeAccessorFromVR(dataRoute)];
        values = data.values as unknown as str[];

        if (target._tag === 'Select') {
            (target.data as nro<RestStringSelect>).options = target.data.options!.map((option) => ({
                ...option,
                default: values.includes(option.value),
            }));
        }

        if (target._tag === 'User' || target._tag === 'Role' || target._tag === 'Channel' || target._tag === 'Mention') {
            resolved = ix.data.resolved! as nopt<RestDataResolved>;

            (target.data as nro<RestStringSelect>).default_values = values.map((v) => ({
                id  : v as snflk,
                type: resolveType(resolved, v as snflk),
            }));
        }
    }

    return {
        cx,
        ax: {
            values,
            route: dataRoute,
            target,
            flags: Flags.assignFlags(dataRoute),
        },
    };
};


export const implementation = <
    A extends ReturnType<typeof Driver.make>,
>(
    driver: A,
    anyIx: IxD,
) => g(function * () {
    const ix = anyIx as IxIn;

    const {cx: sx, ax} = parseIx(ix);


    if (ax.route.mod === Const.CLOSE) {
        return yield * DiscordApi.deleteMenu(ix);
    }
    if (!(ax.route.view in driver.views)) {
        return yield * new RenderError({});
    }

    const context = createHookContext(driver.name, ax.route.view, ix.message?.embeds[0] ?? {});

    const preview = driver.views[ax.route.view].view(driver.name);

    const clicked = preview
        .components
        .flat()
        .find((vx) => vx.route.row === ax.route.row && vx.route.col === ax.route.col);

    clicked?.onClick?.({}, {});

    const nextView = context.views[1];

    if (!(nextView in driver.views)) {
        console.log(context.views);
        return yield * new DeveloperError({});
    }

    const view = driver.views[nextView].view(driver.name);

    const [controller, ...embeds] = view.embeds;
    const updatedContext          = updateHookContext({
        ...context,
        embed: controller,
    });

    const grid = makeGrid(view.components);

    yield * DiscordApi.editMenu(ix, {
        embeds    : [updatedContext.embed, ...embeds],
        components: grid,
    });
}).pipe(
    E.catchAll((e) => CSL.debug(inspect(e, false, null))),
    E.catchAllDefect((e) => CSL.debug(inspect(e, false, null))),
);


// const scp = p(sx, Kv.filter((v) => v.route.name === ax.route.name));
// let scn   = {};
//
// if (ax.flags.includes(Flags.Id.Action)) {
//   const slice       = driver.slices[ax.route.name!];
//   const action      = slice.reducers[ax.route.action!];
//   const data        = driver.slices[ax.route.name!].data;
//   const scp_aliased = p(scp, Kv.mapEntries((v) => [data[v.route.data!].data, v]));
//   const scn_aliased = yield * action({}, scp_aliased);
//
//   scn = p(scn_aliased, Kv.mapEntries((v, k) => {
//     const spec = data[k];
//     return [CxVR.makeAccessor(spec.slice, spec.data), Cx.C[spec.type](v as never)];
//   }));
// }
