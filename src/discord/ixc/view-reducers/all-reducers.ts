import {linkAccountReducer} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import {clanSelectReducer} from '#src/discord/ixc/view-reducers/clans/clan-select.ts';
import {userEditReducer} from '#src/discord/ixc/view-reducers/user-edit.ts';
import {selectRosterReducer} from '#src/discord/ixc/view-reducers/rosters/roster-select.ts';
import {rosterSignupReducer} from '#src/discord/ixc/view-reducers/roster-signup.ts';
import {clanViewerReducer} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {rosterOptOutReducer} from '#src/discord/ixc/view-reducers/roster-opt-out.ts';
import {embedEditorReducer} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {dateTimeEditorReducer} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {infoBoardReducer} from '#src/discord/ixc/view-reducers/board-info.ts';
import {linkClanReducer} from '#src/discord/ixc/view-reducers/links/link-clan.ts';
import {linkAccountAdminReducer} from '#src/discord/ixc/view-reducers/links/link-account-admin.ts';
import {rosterViewerReducer} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {clanViewerAdminReducer} from '#src/discord/ixc/view-reducers/clan-viewer-admin.ts';
import {rosterViewerAdminReducer} from '#src/discord/ixc/view-reducers/roster-viewer-admin.ts';
import {rosterCreateReducer} from '#src/discord/ixc/view-reducers/roster-create.ts';
import {accountViewerReducer} from '#src/discord/ixc/view-reducers/account-viewer.ts';
import {accountViewerAdminReducer} from '#src/discord/ixc/view-reducers/account-viewer-admin.ts';


export const allReducers = {
    ...linkAccountReducer,
    ...linkAccountAdminReducer,
    ...linkClanReducer,


    ...accountViewerReducer,
    ...accountViewerAdminReducer,

    ...clanSelectReducer,
    ...dateTimeEditorReducer,
    ...embedEditorReducer,


    ...clanViewerReducer,
    ...clanViewerAdminReducer,


    ...rosterCreateReducer,
    ...rosterOptOutReducer,
    ...rosterSignupReducer,
    ...rosterViewerReducer,
    ...rosterViewerAdminReducer,


    ...infoBoardReducer,


    ...selectRosterReducer,
    ...userEditReducer,


};
