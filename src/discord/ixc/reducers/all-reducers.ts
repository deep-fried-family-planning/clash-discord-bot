import {reducerFirst} from '#src/discord/ixc/reducers/reducer-first.ts';
import {reducerEntry} from '#src/discord/ixc/reducers/reducer-entry.ts';
import {reducerUser} from '#src/discord/ixc/reducers/reducer-user.ts';
import {reducerAccounts} from '#src/discord/ixc/reducers/reducer-accounts.ts';
import {reducerNewLink} from '#src/discord/ixc/reducers/reducer-new-link.ts';
import {reducerClans} from '#src/discord/ixc/reducers/reducer-clans.ts';
import {reducerRoster} from '#src/discord/ixc/reducers/reducer-roster.ts';
import {reducerRosterAdmin} from '#src/discord/ixc/reducers/reducer-roster-admin.ts';
import {reducerEntryMenu} from '#src/discord/ixc/reducers/reducer-entry-menu.ts';
import {clanSelectReducer} from '#src/discord/ixc/component-reducers/clan-select.ts';
import {editUserReducer} from '#src/discord/ixc/component-reducers/user-edit.ts';
import {selectRosterReducer} from '#src/discord/ixc/component-reducers/roster-select.ts';
import {signupRosterReducer} from '#src/discord/ixc/component-reducers/roster-signup.ts';
import {clanViewerReducer} from '#src/discord/ixc/component-reducers/clan-viewer.ts';
import {rosterManageReducer} from '#src/discord/ixc/component-reducers/roster-manage.ts';
import {optoutRosterReducer} from '#src/discord/ixc/component-reducers/roster-opt-out.ts';
import {rosterCreateReducer} from '#src/discord/ixc/component-reducers/roster-create.ts';
import {embedEditorReducer} from '#src/discord/ixc/component-reducers/embed-editor.ts';


export const allReducers = {

    ...clanSelectReducer,
    ...clanViewerReducer,
    ...embedEditorReducer,
    ...selectRosterReducer,
    ...signupRosterReducer,
    ...optoutRosterReducer,
    ...rosterManageReducer,
    ...rosterCreateReducer,

    ...editUserReducer,

    ...reducerFirst,
    ...reducerEntry,
    ...reducerNewLink,
    ...reducerAccounts,
    ...reducerUser,
    ...reducerClans,
    ...reducerEntryMenu,
};
