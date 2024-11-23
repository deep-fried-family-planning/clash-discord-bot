import {linkAccountReducer} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import {clanSelectReducer} from '#src/discord/ixc/view-reducers/old/clan-select.ts';
import {userEditReducer} from '#src/discord/ixc/view-reducers/user-settings.ts';
import {rosterSelectReducer} from '#src/discord/ixc/view-reducers/old/roster-select.ts';
import {rosterViewerSignupReducer} from '#src/discord/ixc/view-reducers/roster-viewer-signup.ts';
import {clanViewerReducer} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {rosterViewerOptOutReducer} from '#src/discord/ixc/view-reducers/roster-viewer-opt-out.ts';
import {embedEditorReducer} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {dateTimeEditorReducer} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {infoBoardReducer} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {linkClanReducer} from '#src/discord/ixc/view-reducers/links/link-clan.ts';
import {linkAccountAdminReducer} from '#src/discord/ixc/view-reducers/links/link-account-admin.ts';
import {rosterViewerReducer} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {clanViewerAdminReducer} from '#src/discord/ixc/view-reducers/clan-viewer-admin.ts';
import {rosterViewerAdminReducer} from '#src/discord/ixc/view-reducers/roster-viewer-admin.ts';
import {rosterViewerCreatorReducer} from '#src/discord/ixc/view-reducers/roster-viewer-creator.ts';
import {accountViewerReducer} from '#src/discord/ixc/view-reducers/account-viewer.ts';
import {accountViewerAdminReducer} from '#src/discord/ixc/view-reducers/account-viewer-admin.ts';
import {serverViewerReducer} from '#src/discord/ixc/view-reducers/server-viewer.ts';
import {serverViewerAdminReducer} from '#src/discord/ixc/view-reducers/server-viewer-admin.ts';
import {infoViewerReducer} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {infoViewerAdminReducer} from '#src/discord/ixc/view-reducers/info-viewer-admin.ts';
import {botViewerReducer} from '#src/discord/ixc/view-reducers/bot-viewer.ts';
import {infoViewerCreatorReducer} from '#src/discord/ixc/view-reducers/info-viewer-creator.ts';


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

    ...clanViewerReducer,
    ...clanViewerAdminReducer,

    ...infoViewerReducer,
    ...infoViewerAdminReducer,
    ...infoViewerCreatorReducer,

    ...rosterViewerOptOutReducer,
    ...rosterViewerSignupReducer,
    ...rosterViewerReducer,
    ...rosterViewerAdminReducer,
    ...rosterViewerCreatorReducer,

    ...infoBoardReducer,


    ...serverViewerReducer,
    ...serverViewerAdminReducer,

    ...userEditReducer,
};
