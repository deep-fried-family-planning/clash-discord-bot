import {reducerFirst} from '#src/discord/ixc/reducers/reducer-first.ts';
import {reducerEntry} from '#src/discord/ixc/reducers/reducer-entry.ts';
import {reducerUser} from '#src/discord/ixc/reducers/reducer-user.ts';
import {reducerAccounts} from '#src/discord/ixc/reducers/reducer-accounts.ts';
import {reducerNewLink} from '#src/discord/ixc/reducers/reducer-new-link.ts';
import {reducerClans} from '#src/discord/ixc/reducers/reducer-clans.ts';
import {reducerRoster} from '#src/discord/ixc/reducers/reducer-roster.ts';
import {reducerRosterAdmin} from '#src/discord/ixc/reducers/reducer-roster-admin.ts';


export const allReducers = {
    ...reducerFirst,
    ...reducerEntry,
    ...reducerNewLink,
    ...reducerAccounts,
    ...reducerUser,
    ...reducerRoster,
    ...reducerRosterAdmin,
    ...reducerClans,
};
