import {accountViewerAdminReducer} from '#src/internal/discord-old/view-reducers/account-viewer-admin.ts';
import {accountViewerReducer} from '#src/internal/discord-old/view-reducers/account-viewer.ts';
import {botViewerDevReducer} from '#src/internal/discord-old/view-reducers/bot-viewer-dev.ts';
import {botViewerReducer} from '#src/internal/discord-old/view-reducers/bot-viewer.ts';
import {clanViewerAdminReducer} from '#src/internal/discord-old/view-reducers/clan-viewer-admin.ts';
import {clanViewerReducer} from '#src/internal/discord-old/view-reducers/clan-viewer.ts';
import {directoryViewerReducer} from '#src/internal/discord-old/view-reducers/directory-viewer.ts';
import {dateTimeEditorReducer} from '#src/internal/discord-old/view-reducers/editors/embed-date-time-editor.ts';
import {embedEditorReducer} from '#src/internal/discord-old/view-reducers/editors/embed-editor.ts';
import {infoViewerAdminReducer} from '#src/internal/discord-old/view-reducers/info-viewer-admin.ts';
import {infoViewerCreatorReducer} from '#src/internal/discord-old/view-reducers/info-viewer-creator.ts';
import {infoViewerReducer} from '#src/internal/discord-old/view-reducers/info-viewer.ts';
import {linkAccountAdminReducer} from '#src/internal/discord-old/view-reducers/links/link-account-admin.ts';
import {linkAccountReducer} from '#src/internal/discord-old/view-reducers/links/link-account.ts';
import {linkClanReducer} from '#src/internal/discord-old/view-reducers/links/link-clan.ts';
import {clanSelectReducer} from '#src/internal/discord-old/view-reducers/old/clan-select.ts';
import {rosterSelectReducer} from '#src/internal/discord-old/view-reducers/old/roster-select.ts';
import {infoBoardReducer} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {rosterOverviewReducer} from '#src/internal/discord-old/view-reducers/roster-overview.ts';
import {rosterViewerAdminReducer} from '#src/internal/discord-old/view-reducers/roster-viewer-admin.ts';
import {rosterViewerCreatorReducer} from '#src/internal/discord-old/view-reducers/roster-viewer-creator.ts';
import {rosterViewerOptOutAdminReducer} from '#src/internal/discord-old/view-reducers/roster-viewer-opt-out-admin.ts';
import {rosterViewerOptOutReducer} from '#src/internal/discord-old/view-reducers/roster-viewer-opt-out.ts';
import {rosterViewerSignupAdminReducer} from '#src/internal/discord-old/view-reducers/roster-viewer-signup-admin.ts';
import {rosterViewerSignupReducer} from '#src/internal/discord-old/view-reducers/roster-viewer-signup.ts';
import {rosterViewerReducer} from '#src/internal/discord-old/view-reducers/roster-viewer.ts';
import {serverViewerAdminReducer} from '#src/internal/discord-old/view-reducers/server-viewer-admin.ts';
import {serverViewerReducer} from '#src/internal/discord-old/view-reducers/server-viewer.ts';
import {userEditReducer} from '#src/internal/discord-old/view-reducers/user-settings.ts';

export const allReducers = {
  ...linkAccountReducer,
  ...linkAccountAdminReducer,
  ...linkClanReducer,
  ...rosterSelectReducer,
  ...clanSelectReducer,
  ...dateTimeEditorReducer,
  ...embedEditorReducer,

  ...accountViewerReducer,
  ...accountViewerAdminReducer,

  ...botViewerReducer,
  ...botViewerDevReducer,

  ...clanViewerReducer,
  ...clanViewerAdminReducer,

  ...directoryViewerReducer,

  ...infoViewerReducer,
  ...infoViewerAdminReducer,
  ...infoViewerCreatorReducer,

  ...rosterOverviewReducer,

  ...rosterViewerOptOutReducer,
  ...rosterViewerOptOutAdminReducer,

  ...rosterViewerSignupReducer,
  ...rosterViewerSignupAdminReducer,

  ...rosterViewerReducer,
  ...rosterViewerAdminReducer,
  ...rosterViewerCreatorReducer,

  ...infoBoardReducer,

  ...serverViewerReducer,
  ...serverViewerAdminReducer,

  ...userEditReducer,
};
