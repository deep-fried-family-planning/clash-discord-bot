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


export const allReducers = {

    ...clanSelectReducer,
    ...clanViewerReducer,
    ...selectRosterReducer,
    ...signupRosterReducer,
    ...editUserReducer,

    ...reducerFirst,
    ...reducerEntry,
    ...reducerNewLink,
    ...reducerAccounts,
    ...reducerUser,
    ...reducerClans,
    ...reducerEntryMenu,
};
