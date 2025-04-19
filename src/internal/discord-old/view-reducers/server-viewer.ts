import {RK_OPEN} from '#src/constants/route-kind.ts';
import {unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, PrimaryB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import type {snflk} from '#src/internal/discord-old/types.ts';
import {OmbiBoardB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {ServerViewerAdminB} from '#src/internal/discord-old/view-reducers/server-viewer-admin.ts';

import {E} from '#src/internal/pure/effect.ts';



export const ServerViewerB = PrimaryB.as(makeId(RK_OPEN, 'SV'), {
  label: 'Server',
});


const view = (s: St, ax: Ax) => E.gen(function* () {
  return {
    ...s,
    title      : 'Server',
    description: unset,

    editor: unset,
    viewer: unset,
    status: unset,

    back: BackB.as(OmbiBoardB.id),

    delete: ServerViewerAdminB
      .if(s.user_roles.includes(s.server!.admin as snflk)),
  } satisfies St;
});


export const serverViewerReducer = {
  [ServerViewerB.id.predicate]: view,
};
