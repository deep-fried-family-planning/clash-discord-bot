import {typeRx, makeId, typeRxHelper} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {DangerB, ForwardB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';


const axn = {
    OPTOUT_ROSTER_OPEN           : makeId(RDXK.INIT, 'ROO'),
    OPTOUT_ROSTER_ACCOUNTS_UPDATE: makeId(RDXK.UPDATE, 'ROO'),
    OPTOUT_ROSTER_SUBMIT         : makeId(RDXK.SUBMIT, 'ROO'),
};


export const OptoutRosterB = DangerB.as(axn.OPTOUT_ROSTER_OPEN, {
    label: 'Opt Out',
});

const SelectAccounts = SingleS.as(axn.OPTOUT_ROSTER_ACCOUNTS_UPDATE, {
    placeholder: 'Select Accounts',
});


const SubmitSignup = DangerB.as(axn.OPTOUT_ROSTER_SUBMIT, {label: 'Opt Out'});


const getSignupsByUser = typeRxHelper((s, ax) => E.gen(function * () {
    return [{
        label: 'NOOP',
        value: 'NOOP',
    }];
}));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (ax.id.predicate === axn.OPTOUT_ROSTER_OPEN.predicate) {
        Accounts = SelectAccounts.as(axn.OPTOUT_ROSTER_ACCOUNTS_UPDATE, {
            options: yield * getSignupsByUser(s, ax),
        });
    }

    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

    const Submit = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    return {
        ...s,
        title : 'Roster Opt Out',
        sel1  : Accounts,
        submit: Submit.render({
            disabled:
                Accounts.values.length === 0,
        }),
        forward: Forward.render({
            disabled:
                Accounts.values.length === 0,
        }),
    };
}));


export const optoutRosterReducer = {
    [OptoutRosterB.id.predicate] : view,
    [SelectAccounts.id.predicate]: view,
    [SubmitSignup.id.predicate]  : view,
};

