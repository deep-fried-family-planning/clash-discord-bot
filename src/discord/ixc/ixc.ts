import {LinkAccountHelp, LinkAccountStart, ModalLinkAccount} from '#src/discord/ixc/links/link-account.ts';
import {DeleteAccount, ManageAccounts, SelectAccount} from '#src/discord/ixc/links/manage-accounts.ts';
import {EditQuietEnd, EditQuietStart, EditTimezone, ManageUser} from '#src/discord/ixc/links/manage-user.ts';
import {Refresh} from '#src/discord/ixc/links/refresh.ts';
import {EntryLinks} from '#src/discord/ixc/links/links.ts';


export const IXC_ENTRY = [
    EntryLinks,
];


export const IXC_EPHEMERAL = [
    LinkAccountStart,
    LinkAccountHelp,
    ModalLinkAccount,
    ManageAccounts,
    SelectAccount,
    DeleteAccount,
    ManageUser,
    EditTimezone,
    EditQuietStart,
    EditQuietEnd,
    Refresh,
];
