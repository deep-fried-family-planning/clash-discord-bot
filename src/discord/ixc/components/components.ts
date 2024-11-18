import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {SELECT_TIMES, SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {makeSelect} from '#src/discord/ixc/components/make-select.ts';
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */


export const NewLinkButton = makeButton(AXN.START_NEW_LINK.params, {
    label: 'New Link',
    style: IXCBS.SUCCESS,
});


export const AccountsButton = makeButton(AXN.START_ACCOUNTS.params, {
    label: 'Accounts',
    style: IXCBS.PRIMARY,
});

export const ChangeAccountTypeButton = makeButton(AXN.START_ACCOUNT_TYPE.params, {
    label: 'Type',
    style: IXCBS.PRIMARY,
});

export const AccountSelector = makeSelect(AXN.UPDATE_SELECT_ACCOUNT.params, {
    placeholder: 'Select Account',
});

export const AccountTypeSelector = makeSelect(AXN.UPDATE_ACCOUNT_TYPE.params, {
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


export const DeleteAccountButton = makeButton(AXN.START_ACCOUNT_TYPE.params, {
    label: 'Delete',
    style: IXCBS.DANGER,
});


export const UserButton = makeButton(AXN.OPEN_USER.params, {
    label: 'User',
    style: IXCBS.PRIMARY,
});

export const TimezoneButton = makeButton(AXN.START_TIMEZONE.params, {
    label: 'Timezone',
    style: IXCBS.PRIMARY,
});

export const TimezoneSelector = makeSelect(AXN.UPDATE_TIMEZONE.params, {
    placeholder: 'Timezone',
    options    : SELECT_TIMEZONES as any,
});

export const QuietStartSelector = makeSelect(AXN.UPDATE_TIMEZONE.params, {
    placeholder: 'Quiet (start)',
    options    : SELECT_TIMES as any,
});

export const QuietEndSelector = makeSelect(AXN.UPDATE_TIMEZONE.params, {
    placeholder: 'Quiet (end)',
    options    : SELECT_TIMES as any,
});

