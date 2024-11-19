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

    const embeds = [
        {
            ...jsonEmbed({
                id  : ax.id.custom_id,
                ...ax.id.params,
                cmap: ax.cmap,
            }),
            color: nColor(COLOR.DEBUG),
        },
        dEmbed(COLOR.ORIGINAL, 'User Info',
            `<@${s.user_id}>`,
            `<@&${s.server?.admin}>`,
        ),
        s.info?.description ? {
            ...s.info,
            color: nColor(COLOR.INFO),
        } : undefined,
        s.select ? {
            ...s.select,
            color: nColor(COLOR.DEBUG),
        } : undefined,
        s.status ? {
            ...s.status,
            color: nColor(COLOR.SUCCESS),
        } : undefined,
    ].filter(Boolean) as Embed[];

    const components = pipe(
        [
            [s.navigate?.component].filter(Boolean),
            s.row1?.filter(Boolean).map((c) => c?.component),
            s.row2?.filter(Boolean).map((c) => c?.component),
            s.row3?.filter(Boolean).map((c) => c?.component),
            [
                s.back?.component,
                s.submit?.component,
                s.next?.component,
                s.forward?.component,
                s.close?.component,
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
