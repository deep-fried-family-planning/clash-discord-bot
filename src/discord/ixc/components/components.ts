import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {SELECT_TIMES, SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {makeSelect} from '#src/discord/ixc/components/make-select.ts';
import {makeText} from '#src/discord/ixc/components/make-text.ts';
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */


export const NewLinkB = makeButton(AXN.NLINK_OPEN, {
    label: 'New Link',
    style: IXCBS.SUCCESS,
});
export const LinkMB = makeButton(AXN.NLINK_MODAL_OPEN, {
    label: 'Open Link Modal',
    style: IXCBS.SUCCESS,
});


export const AccountsB = makeButton(AXN.ACCOUNTS_OPEN, {
    label: 'Accounts',
    style: IXCBS.PRIMARY,
});

export const ChangeAccountTypeButton = makeButton(AXN.ACCOUNT_TYPE_OPEN, {
    label: 'Change Type',
    style: IXCBS.PRIMARY,
});

export const AccountS = makeSelect(AXN.ACCOUNTS_SELECT_UPDATE, {
    placeholder: 'Select Account',
});

export const AccountTypeS = makeSelect(AXN.ACCOUNT_TYPE_UPDATE, {
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


export const DeleteAccountButton = makeButton(AXN.ACCOUNT_TYPE_OPEN, {
    label: 'Delete',
    style: IXCBS.DANGER,
});


export const UserB = makeButton(AXN.USER_OPEN, {
    label: 'User',
    style: IXCBS.PRIMARY,
});

export const TimezoneButton = makeButton(AXN.USER_TZ_OPEN, {
    label: 'Timezone',
    style: IXCBS.PRIMARY,
});

export const TimezoneS = makeSelect(AXN.USER_TZ_UPDATE, {
    placeholder: 'Timezone',
    options    : SELECT_TIMEZONES as any,
});

export const QuietStartSelector = makeSelect(AXN.USER_TZ_UPDATE, {
    placeholder: 'Quiet (start)',
    options    : SELECT_TIMES as any,
});

export const QuietEndSelector = makeSelect(AXN.USER_TZ_UPDATE, {
    placeholder: 'Quiet (end)',
    options    : SELECT_TIMES as any,
});


export const TagMT = makeText(AXN.NLINK_TAG, {

});
export const ApiMT = makeText(AXN.NLINK_API, {

});


export const ClansB = makeButton(AXN.CLANS_OPEN, {
    label: 'Clans',
    style: IXCBS.PRIMARY,
});
export const ClanSF = makeSelect(AXN.CLANS_FILTER, {
    placeholder: 'Filter Clan Type',
    options    : [{label: 'NOOP', value: 'NOOP'}],
});
export const ClanS = makeSelect(AXN.CLANS_SELECT, {
    placeholder: 'Select Clan',
});


export const RosterJoinB = makeButton(AXN.ROSTER_JOIN_OPEN, {
    label: 'Join',
    style: IXCBS.PRIMARY,
});
export const RosterSF = makeSelect(AXN.ROSTER_SELECT_FILTER, {
    placeholder: 'Filter Roster Type',
    options    : [{label: 'NOOP', value: 'NOOP'}],
});
export const RosterS = makeSelect(AXN.ROSTER_SELECT_UPDATE, {
    placeholder: 'Select Roster',
    options    : [{label: 'NOOP', value: 'NOOP'}],
});


export const RosterAdminB = makeButton(AXN.ROSTER_ADMIN_OPEN, {
    label: 'Roster Admin',
    style: IXCBS.DANGER,
});
export const RosterCreateB = makeButton(AXN.ROSTER_CREATE, {
    label: 'Create',
    style: IXCBS.SUCCESS,
});


export const RosterEditB = makeButton(AXN.ROSTER_EDIT, {
    label: 'Edit',
    style: IXCBS.PRIMARY,
});


export const RosterDeleteB = makeButton(AXN.ROSTER_DELETE, {
    label: 'Delete',
    style: IXCBS.DANGER,
});


