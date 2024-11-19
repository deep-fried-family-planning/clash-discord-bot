import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {SELECT_TIMES, SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {makeSelect} from '#src/discord/ixc/components/make-select.ts';
import {makeText} from '#src/discord/ixc/components/make-text.ts';
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */


export const NewLinkB = makeButton(AXN.NEW_LINK_OPEN.params, {
    label: 'New Link',
    style: IXCBS.SUCCESS,
});
export const LinkMB = makeButton(AXN.NEW_LINK_MODAL_OPEN.params, {
    label: 'Open Link Modal',
    style: IXCBS.SUCCESS,
});


export const AccountsB = makeButton(AXN.ACCOUNTS_OPEN.params, {
    label: 'Accounts',
    style: IXCBS.PRIMARY,
});

export const ChangeAccountTypeButton = makeButton(AXN.ACCOUNT_TYPE_OPEN.params, {
    label: 'Change Type',
    style: IXCBS.PRIMARY,
});

export const AccountS = makeSelect(AXN.ACCOUNTS_SELECT_UPDATE.params, {
    placeholder: 'Select Account',
});

export const AccountTypeS = makeSelect(AXN.ACCOUNT_TYPE_UPDATE.params, {
    placeholder: 'Select Type',
    options    : [
        {label: 'main', value: 'main'},
        {label: 'alt', value: 'alt'},
        {label: 'donation', value: 'donation'},
        {label: 'war asset', value: 'war-asset'},
        {label: 'clan capital', value: 'clan-capital'},
        {label: 'strategic rush', value: 'strategic-rush'},
        {label: 'hyper rush', value: 'hyper-rush'},
        {label: 'admin parking', value: 'admin-parking'},
    ],
});


export const DeleteAccountButton = makeButton(AXN.ACCOUNT_TYPE_OPEN.params, {
    label: 'Delete',
    style: IXCBS.DANGER,
});


export const UserB = makeButton(AXN.USER_OPEN.params, {
    label: 'User',
    style: IXCBS.PRIMARY,
});

export const TimezoneButton = makeButton(AXN.USER_TIMEZONE_OPEN.params, {
    label: 'Timezone',
    style: IXCBS.PRIMARY,
});

export const TimezoneS = makeSelect(AXN.USER_TIMEZONE_UPDATE.params, {
    placeholder: 'Timezone',
    options    : SELECT_TIMEZONES as any,
});

export const QuietStartSelector = makeSelect(AXN.USER_TIMEZONE_UPDATE.params, {
    placeholder: 'Quiet (start)',
    options    : SELECT_TIMES as any,
});

export const QuietEndSelector = makeSelect(AXN.USER_TIMEZONE_UPDATE.params, {
    placeholder: 'Quiet (end)',
    options    : SELECT_TIMES as any,
});


export const TagMT = makeText(AXN.TAG.params, {

});
export const ApiMT = makeText(AXN.API.params, {

});


export const ClansB = makeButton(AXN.CLANS_OPEN.params, {
    label: 'Clans',
    style: IXCBS.PRIMARY,
});
export const ClanSF = makeSelect(AXN.CLANS_FILTER.params, {
    placeholder: 'Filter Clan Type',
    options    : [{label: 'NOOP', value: 'NOOP'}],
});
export const ClanS = makeSelect(AXN.CLANS_SELECT.params, {
    placeholder: 'Select Clan',
});


export const RosterJoinB = makeButton(AXN.ROSTER_JOIN_OPEN.params, {
    label: 'Join',
    style: IXCBS.PRIMARY,
});
export const RosterSF = makeSelect(AXN.ROSTER_SELECT_FILTER.params, {
    placeholder: 'Filter Roster Type',
    options    : [{label: 'NOOP', value: 'NOOP'}],
});
export const RosterS = makeSelect(AXN.ROSTER_SELECT_UPDATE.params, {
    placeholder: 'Select Roster',
    options    : [{label: 'NOOP', value: 'NOOP'}],
});


export const RosterAdminB = makeButton(AXN.ROSTER_ADMIN_OPEN.params, {
    label: 'Roster Admin',
    style: IXCBS.DANGER,
});
export const RosterCreateB = makeButton(AXN.ROSTER_CREATE.params, {
    label: 'Create',
    style: IXCBS.SUCCESS,
});


export const RosterEditB = makeButton(AXN.ROSTER_EDIT.params, {
    label: 'Edit',
    style: IXCBS.PRIMARY,
});


export const RosterDeleteB = makeButton(AXN.ROSTER_DELETE.params, {
    label: 'Delete',
    style: IXCBS.DANGER,
});

