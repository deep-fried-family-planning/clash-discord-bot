import {accountViewerAdminReducer} from '#src/discord/view-reducers/account-viewer-admin.ts';
import {accountViewerReducer} from '#src/discord/view-reducers/account-viewer.ts';
import {botViewerDevReducer} from '#src/discord/view-reducers/bot-viewer-dev.ts';
import {botViewerReducer} from '#src/discord/view-reducers/bot-viewer.ts';
import {clanViewerAdminReducer} from '#src/discord/view-reducers/clan-viewer-admin.ts';
import {clanViewerReducer} from '#src/discord/view-reducers/clan-viewer.ts';
import {directoryViewerReducer} from '#src/discord/view-reducers/directory-viewer.ts';
import {dateTimeEditorReducer} from '#src/discord/view-reducers/editors/embed-date-time-editor.ts';
import {embedEditorReducer} from '#src/discord/view-reducers/editors/embed-editor.ts';
import {infoViewerAdminReducer} from '#src/discord/view-reducers/info-viewer-admin.ts';
import {infoViewerCreatorReducer} from '#src/discord/view-reducers/info-viewer-creator.ts';
import {infoViewerReducer} from '#src/discord/view-reducers/info-viewer.ts';
import {linkAccountAdminReducer} from '#src/discord/view-reducers/links/link-account-admin.ts';
import {linkAccountReducer} from '#src/discord/view-reducers/links/link-account.ts';
import {linkClanReducer} from '#src/discord/view-reducers/links/link-clan.ts';
import {clanSelectReducer} from '#src/discord/view-reducers/old/clan-select.ts';
import {rosterSelectReducer} from '#src/discord/view-reducers/old/roster-select.ts';
import {infoBoardReducer} from '#src/discord/view-reducers/omni-board.ts';
import {rosterOverviewReducer} from '#src/discord/view-reducers/roster-overview.ts';
import {rosterViewerAdminReducer} from '#src/discord/view-reducers/roster-viewer-admin.ts';
import {rosterViewerCreatorReducer} from '#src/discord/view-reducers/roster-viewer-creator.ts';
import {rosterViewerOptOutAdminReducer} from '#src/discord/view-reducers/roster-viewer-opt-out-admin.ts';
import {rosterViewerOptOutReducer} from '#src/discord/view-reducers/roster-viewer-opt-out.ts';
import {rosterViewerSignupAdminReducer} from '#src/discord/view-reducers/roster-viewer-signup-admin.ts';
import {rosterViewerSignupReducer} from '#src/discord/view-reducers/roster-viewer-signup.ts';
import {rosterViewerReducer} from '#src/discord/view-reducers/roster-viewer.ts';
import {serverViewerAdminReducer} from '#src/discord/view-reducers/server-viewer-admin.ts';
import {serverViewerReducer} from '#src/discord/view-reducers/server-viewer.ts';
import {userEditReducer} from '#src/discord/view-reducers/user-settings.ts';


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
