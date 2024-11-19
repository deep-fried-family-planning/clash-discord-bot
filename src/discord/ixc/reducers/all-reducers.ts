import {reducerFirst} from '#src/discord/ixc/reducers/reducer-first.ts';
import {reducerEntry} from '#src/discord/ixc/reducers/reducer-entry.ts';
import {reducerUser} from '#src/discord/ixc/reducers/reducer-user.ts';
import {reducerAccounts} from '#src/discord/ixc/reducers/reducer-accounts.ts';
import {reducerNewLink} from '#src/discord/ixc/reducers/reducer-new-link.ts';
import {reducerClans} from '#src/discord/ixc/reducers/reducer-clans.ts';
import {reducerRoster} from '#src/discord/ixc/reducers/reducer-roster.ts';
import {reducerRosterAdmin} from '#src/discord/ixc/reducers/reducer-roster-admin.ts';
import {reducerEntryMenu} from '#src/discord/ixc/reducers/reducer-entry-menu.ts';
import {selectClanReducer} from '#src/discord/ixc/component-reducers/select-clan.ts';
import {editUserReducer} from '#src/discord/ixc/component-reducers/edit-user.ts';


export const allReducers = {

    ...selectClanReducer,
    ...editUserReducer,

    ...reducerFirst,
    ...reducerEntry,
    ...reducerNewLink,
    ...reducerAccounts,
    ...reducerUser,
    ...reducerRoster,
    ...reducerRosterAdmin,
    ...reducerClans,
    ...reducerEntryMenu,
};
