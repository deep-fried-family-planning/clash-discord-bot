import {RK_OPEN} from '#src/constants/route-kind.ts';
import {unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, DangerB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {OmbiBoardB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {E} from '#src/internal/pure/effect.ts';

export const DEVS = [
  '644290645350940692',
  '267835119421751306',
];

export const BotViewerDevB = DangerB.as(makeId(RK_OPEN, 'BVD'), {
  label: 'Dev',
});

const view = (s: St, ax: Ax) => E.gen(function* () {
  return {
    ...s,
    title      : 'Secret',
    description: unset,

    editor: unset,
    viewer: unset,
    status: unset,

    back: BackB.as(OmbiBoardB.id),
  } satisfies St;
});

export const botViewerDevReducer = {
  [BotViewerDevB.id.predicate]: view,
};
