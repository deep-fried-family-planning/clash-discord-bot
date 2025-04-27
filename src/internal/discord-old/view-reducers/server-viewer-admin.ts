import {RK_OPEN} from '#src/constants/route-kind.ts';
import {unset} from '#src/internal/discord-old/components/component-utils.ts';
import {AdminB, BackB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {ServerViewerB} from '#src/internal/discord-old/view-reducers/server-viewer.ts';

import {E} from '#src/internal/pure/effect.ts';

export const ServerViewerAdminB = AdminB.as(makeId(RK_OPEN, 'SVA'));

const view = (s: St, ax: Ax) => E.gen(function* () {
  return {
    ...s,
    title      : 'Edit Server',
    description: unset,

    editor: unset,
    viewer: unset,
    status: unset,

    back: BackB.as(ServerViewerB.id),
  };
});

export const serverViewerAdminReducer = {
  [ServerViewerAdminB.id.predicate]: view,
};
