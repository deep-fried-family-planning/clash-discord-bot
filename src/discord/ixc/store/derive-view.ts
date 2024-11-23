import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {inspect} from 'node:util';
import type {IxRE} from '#src/discord/util/discord.ts';
import type {Embed} from 'dfx/types';
import {filterL} from '#src/internal/pure/pure-list.ts';
import {UI} from 'dfx';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';
import {CloseB} from '#src/discord/ixc/components/global-components.ts';
import {embedIf} from '#src/discord/ixc/components/component-utils.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {IxAction} from '#src/discord/ixc/store/derive-action.ts';


export const deriveView = (s: IxState, ax: IxAction) => E.gen(function * () {
    yield * CSL.debug('[STATE]', inspect(s, true, null));

    const embeds = [
        // {
        //     color: nColor(COLOR.DEBUG),
        //     title: 'Debug',
        //     ...jsonEmbed({
        //         id           : ax.id.custom_id,
        //         ...ax.id.params,
        //         selected     : ax.selected,
        //         predicate    : ax.id.predicate,
        //         nextPredicate: ax.id.nextPredicate,
        //         backPredicate: ax.id.backPredicate,
        //     }),
        // },
        // dEmbed(COLOR.ORIGINAL, 'User Info',
        //     `<@${s.user_id}>`,
        //     `<@&${s.server?.admin}>`,
        // ),
        s.title ? {
            color      : nColor(COLOR.ORIGINAL),
            title      : s.title,
            description: s.description,
        } : undefined,
        s.info?.description
            ? {
                color: nColor(COLOR.INFO),
                ...s.info,
            }
            : undefined,
        s.select
            ? {
                color: nColor(COLOR.DEBUG),
                ...s.select,
            }
            : undefined,
        s.status ? {
            color: nColor(COLOR.SUCCESS),
            ...s.status,
        }
        : undefined,
        embedIf(s.viewer, s.viewer),
        embedIf(s.editor, s.editor),
        embedIf(s.status, s.status),
    ].filter(Boolean) as Embed[];

    const components = pipe(
        [
            [s.navigate?.component].filter(Boolean),

            s.row1?.filter(Boolean).map((c) => c?.component),
            [s.sel1?.component].filter(Boolean),

            s.row2?.filter(Boolean).map((c) => c?.component),
            [s.sel2?.component].filter(Boolean),

            s.row3?.filter(Boolean).map((c) => c?.component),
            [s.sel3?.component].filter(Boolean),

            [
                s.back?.component,
                s.submit?.component,
                s.delete?.component,
                s.next?.component,
                s.forward?.component,
                s.close?.component ?? CloseB.component,
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
