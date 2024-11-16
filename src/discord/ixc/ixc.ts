import {LinksEntryBB, NewLinkBB} from '#src/discord/ixc/links/links-bindings.ts';
import {UserBB, UserQhEndSSSB, UserQhStartSSSB, UserTzSSSB} from '#src/discord/ixc/links/user-bindings.ts';
import {AccountsBB, AccountsChangeTypeSSSB, AccountsDeleteSSSB} from '#src/discord/ixc/links/accounts-bindings.ts';
import {GlobalCloseBB} from '#src/discord/ixc/make/global.ts';


export const IXC_ENTRY = [
    LinksEntryBB,
];


export const IXC_EPHEMERAL = [
    GlobalCloseBB,

    NewLinkBB,

    AccountsBB,
    AccountsChangeTypeSSSB,
    AccountsDeleteSSSB,

    UserBB,
    UserTzSSSB,
    UserQhStartSSSB,
    UserQhEndSSSB,
].flat();
