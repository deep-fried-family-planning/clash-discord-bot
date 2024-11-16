import {makeButton} from '#src/discord/ixc/make/components.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {makeSingleSelectSubmit} from '#src/discord/ixc/make/single-select-submit.ts';


export const AccountsB = makeButton('AccountsB', {
    label: 'Accounts',
    style: IXCBS.SECONDARY,
});


export const AccountsChangeTypeSSS = makeSingleSelectSubmit('AccType', 'Change Type', {
    submitOptions: {
        label: 'Change Type',
    },
});


export const AccountsDeleteSSS = makeSingleSelectSubmit('DelAcc', 'Delete Account', {
    submitOptions: {
        label: 'Delete',
        style: IXCBS.DANGER,
    },
});
