import {linkAccountReducer} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import {clanSelectReducer} from '#src/discord/ixc/view-reducers/clans/clan-select.ts';
import {editUserReducer} from '#src/discord/ixc/view-reducers/user-edit.ts';
import {selectRosterReducer} from '#src/discord/ixc/view-reducers/rosters/roster-select.ts';
import {signupRosterReducer} from '#src/discord/ixc/view-reducers/roster-signup.ts';
import {clanViewerReducer} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {rosterManageReducer} from '#src/discord/ixc/view-reducers/rosters/roster-manage.ts';
import {optoutRosterReducer} from '#src/discord/ixc/view-reducers/rosters/roster-opt-out.ts';
import {rosterCreateReducer} from '#src/discord/ixc/view-reducers/rosters/roster-create.ts';
import {embedEditorReducer} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {dateTimeEditorReducer} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {rosterEditReducer} from '#src/discord/ixc/view-reducers/rosters/roster-edit.ts';
import {infoBoardReducer} from '#src/discord/ixc/view-reducers/board-info.ts';
import {rosterDeleteReducer} from '#src/discord/ixc/view-reducers/rosters/roster-delete.ts';
import {linkClanReducer} from '#src/discord/ixc/view-reducers/links/link-clan.ts';
import {clanManageReducer} from '#src/discord/ixc/view-reducers/clans/clan-manage.ts';
import {clanEditReducer} from '#src/discord/ixc/view-reducers/clans/clan-edit.ts';
import {clanDeleteReducer} from '#src/discord/ixc/view-reducers/clans/clan-delete.ts';
import {linkAccountManageReducer} from '#src/discord/ixc/view-reducers/links/link-account-manage.ts';
import {rosterViewerReducer} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {clanViewerAdminReducer} from '#src/discord/ixc/view-reducers/clan-viewer-admin.ts';
import {rosterViewerAdminReducer} from '#src/discord/ixc/view-reducers/roster-viewer-admin.ts';


export const allReducers = {
    ...clanViewerReducer,
    ...clanViewerAdminReducer,


    ...rosterViewerReducer,
    ...rosterViewerAdminReducer,


    ...infoBoardReducer,
    ...clanDeleteReducer,
    ...clanEditReducer,
    ...clanManageReducer,
    ...clanSelectReducer,
    ...dateTimeEditorReducer,
    ...embedEditorReducer,
    ...selectRosterReducer,
    ...signupRosterReducer,
    ...optoutRosterReducer,
    ...rosterManageReducer,
    ...rosterCreateReducer,
    ...rosterEditReducer,
    ...rosterDeleteReducer,
    ...editUserReducer,
    ...linkAccountReducer,
    ...linkClanReducer,
    ...linkAccountManageReducer,
};
