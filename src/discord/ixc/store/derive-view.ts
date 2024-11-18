import type {IxDcState} from '#src/discord/ixc/store/types.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {inspect} from 'node:util';
import type {IxRE} from '#src/discord/util/discord.ts';
import type {Embed} from 'dfx/types';
import {filterL} from '#src/internal/pure/pure-list.ts';
import {UI} from 'dfx';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';


export const deriveView = (state: IxDcState) => E.gen(function * () {
    yield * CSL.debug('[NEWSTATE]', inspect(state));
    yield * CSL.debug('[PREVIEW]', inspect(state.view));

    if (!state.view) {
        return {
            embeds: [{description: 'this should not happen'}],
        } satisfies Partial<IxRE>;
    }

    const embeds = [
        state.view.info?.description ? {
            ...state.view.info,
            color: nColor(COLOR.INFO),
        } : undefined,
        state.view.selected ? {
            ...state.view.selected,
            color: nColor(COLOR.INFO),
        } : undefined,
        state.view.status ? {
            ...state.view.status,
            color: nColor(COLOR.SUCCESS),
        } : undefined,
    ].filter(Boolean) as Embed[];

    if (!embeds.length) {
        return {
            embeds: [{description: 'this should not happen'}],
        } satisfies Partial<IxRE>;
    }

    const components = pipe(
        [
            [
                state.view.navigator?.component,
            ].filter(Boolean),
            state.view.rows?.[0]?.filter(Boolean).map((c) => c.component),
            state.view.rows?.[1]?.filter(Boolean).map((c) => c.component),
            state.view.rows?.[2]?.filter(Boolean).map((c) => c.component),
            [
                state.view.back?.component,
                state.view.submit?.component,
                state.view.next?.component,
                state.view.forward?.component,
                state.view.close?.component,
            ].filter(Boolean),
        ] as const,
        filterL((cs) => Boolean(cs?.length)),
    );

    if (!components.length) {
        const view = {
            embeds: embeds,
        } satisfies Partial<IxRE>;

        yield * CSL.debug('[VIEW]', inspect(view));

        return view;
    }

    const view = {
        embeds    : embeds,
        components: UI.grid(components as UI.UIComponent[][]),
    } satisfies Partial<IxRE>;

    yield * CSL.debug('[VIEW]', inspect(view));

    return view;
});
