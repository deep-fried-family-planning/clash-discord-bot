import {LinksEntryBB, NewLinkBB} from '#src/discord/ixc/old/links/links-bindings.ts';
import {UserBB, UserQhEndSSSB, UserQhStartSSSB, UserTzSSSB} from '#src/discord/ixc/old/links/user-bindings.ts';
import {AccountsBB, AccountsChangeTypeSSSB, AccountsDeleteSSSB} from '#src/discord/ixc/old/links/accounts-bindings.ts';
import {GlobalCloseBB} from '#src/discord/ixc/old/make/global.ts';


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
