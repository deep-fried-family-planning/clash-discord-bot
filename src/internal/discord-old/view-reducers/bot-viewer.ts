import {LABEL_TITLE_ABOUT_DEEPFRYER} from '#src/constants/label.ts';
import {RK_OPEN} from '#src/constants/route-kind.ts';
import {unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, PrimaryB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {BotViewerDevB, DEVS} from '#src/internal/discord-old/view-reducers/bot-viewer-dev.ts';
import {DirectoryViewerB} from '#src/internal/discord-old/view-reducers/directory-viewer.ts';
import {OmbiBoardB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {E} from '#src/internal/pure/effect.ts';



export const BotViewer = PrimaryB.as(makeId(RK_OPEN, 'BV'), {
  label: 'Bot',
});


const view = (s: St, ax: Ax) => E.gen(function * () {
  return {
    ...s,
    title      : LABEL_TITLE_ABOUT_DEEPFRYER,
    description: unset,

    editor: unset,
    viewer: unset,
    status: unset,

    row1: [
      DirectoryViewerB,
    ],

    back  : BackB.as(OmbiBoardB.id),
    delete: BotViewerDevB.if(DEVS.includes(s.user_id)),
  };
});


export const botViewerReducer = {
  [BotViewer.id.predicate]: view,
};
