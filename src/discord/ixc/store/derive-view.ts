import type {IxAction, IxState} from '#src/discord/ixc/store/types.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {inspect} from 'node:util';
import type {IxRE} from '#src/discord/util/discord.ts';
import type {Embed} from 'dfx/types';
import {filterL} from '#src/internal/pure/pure-list.ts';
import {UI} from 'dfx';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';
import {dEmbed, jsonEmbed} from '#src/discord/util/embed.ts';


export const deriveView = (s: IxState, ax: IxAction) => E.gen(function * () {
    yield * CSL.debug('[STATE]', inspect(s, true, null));
    yield * CSL.debug('[VIEW]', inspect(s.view, true, null));

    if (!s.view) {
        return {
            embeds: [{description: 'this should not happen'}],
        } satisfies Partial<IxRE>;
    }

    const embeds = [
        dEmbed(COLOR.ORIGINAL, 'User Info',
            `<@${s.user_id}>`,
            `<@&${s.server?.admin}>`,
        ),
        s.view.info?.description ? {
            ...s.view.info,
            color: nColor(COLOR.INFO),
        } : undefined,
        s.view.selected ? {
            ...s.view.selected,
            color: nColor(COLOR.DEBUG),
        } : undefined,
        s.view.status ? {
            ...s.view.status,
            color: nColor(COLOR.SUCCESS),
        } : undefined,
        {
            ...jsonEmbed({
                id  : ax.id.custom_id,
                ...ax.id.params,
                cmap: ax.cmap,
            }),
            color: nColor(COLOR.DEBUG),
        },
    ].filter(Boolean) as Embed[];

    if (!embeds.length) {
        return {
            embeds: [{description: 'this should not happen'}],
        } satisfies Partial<IxRE>;
    }

    const components = pipe(
        [
            [
                s.view.navigator?.component,
            ].filter(Boolean),
            s.view.rows?.[0]?.filter(Boolean).map((c) => c.component),
            s.view.rows?.[1]?.filter(Boolean).map((c) => c.component),
            s.view.rows?.[2]?.filter(Boolean).map((c) => c.component),
            [
                s.view.back?.component,
                s.view.submit?.component,
                s.view.next?.component,
                s.view.forward?.component,
                s.view.close?.component,
            ].filter(Boolean),
        ] as const,
        filterL((cs) => Boolean(cs?.length)),
    );

    if (!components.length) {
        const view = {
            embeds: embeds,
        } satisfies Partial<IxRE>;

        yield * CSL.debug('[VIEW]', inspect(view, true, null));

        return view;
    }

    const view = {
        embeds    : embeds,
        components: UI.grid(components as UI.UIComponent[][]),
    } satisfies Partial<IxRE>;

    yield * CSL.debug('[VIEW]', inspect(view, true, null));

    return view;
});
