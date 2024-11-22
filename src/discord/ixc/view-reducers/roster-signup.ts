import {typeRx, makeId, typeRxHelper} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';


const axn = {
    SIGNUP_ROSTER_OPEN               : makeId(RDXK.INIT, 'RS'),
    SIGNUP_ROSTER_AVAILABILITY_UPDATE: makeId(RDXK.UPDATE, 'RSA'),
    SIGNUP_ROSTER_ACCOUNTS_UPDATE    : makeId(RDXK.UPDATE, 'RSAC'),
    SIGNUP_ROSTER_DESIGNATION_UPDATE : makeId(RDXK.UPDATE, 'RSD'),
    SIGNUP_ROSTER_SUBMIT             : makeId(RDXK.SUBMIT, 'RS'),
};


export const SignupRosterB = PrimaryB.as(axn.SIGNUP_ROSTER_OPEN, {
    label: 'Signup',
});

const SelectAvailability = SingleS.as(axn.SIGNUP_ROSTER_AVAILABILITY_UPDATE, {
    placeholder: 'Select Availability',
    options    : [
        {label: 'Round 7', value: 'r7'},
        {label: 'Round 6', value: 'r6'},
        {label: 'Round 5', value: 'r5'},
        {label: 'Round 4', value: 'r4'},
        {label: 'Round 3', value: 'r3'},
        {label: 'Round 2', value: 'r2'},
        {label: 'Round 1', value: 'r1'},
    ],
    max_values: 7,
    min_values: 1,
},
);

const SelectAccounts = SingleS.as(axn.SIGNUP_ROSTER_ACCOUNTS_UPDATE, {
    placeholder: 'Select Accounts',
});

const SelectDesignation = SingleS.as(axn.SIGNUP_ROSTER_DESIGNATION_UPDATE, {
    placeholder: 'Select Designation',
    options    : [{
        label: 'Default',
        value: 'default',
    }, {
        label: 'Designated 2 Star',
        value: 'dsg',
    }],
});

const SubmitSignup = SubmitB.as(axn.SIGNUP_ROSTER_SUBMIT, {label: 'Signup'});


const getSignupsByUser = typeRxHelper((s, ax) => E.gen(function * () {
    return [{
        label: 'NOOP',
        value: 'NOOP',
    }];
}));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (ax.id.predicate === axn.SIGNUP_ROSTER_OPEN.predicate) {
        Accounts = SelectAccounts.as(axn.SIGNUP_ROSTER_ACCOUNTS_UPDATE, {
            options: yield * getSignupsByUser(s, ax),
        });
    }

    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

    const Availability = SelectAvailability.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Designation = SelectDesignation.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Submit = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    return {
        ...s,
        title : 'Roster Signup',
        sel1  : Accounts,
        sel2  : Availability,
        sel3  : Designation,
        submit: Submit.render({
            disabled:
                Designation.values.length === 0
                || Availability.values.length === 0
                || Accounts.values.length === 0,
        }),
        forward: Forward.render({
            disabled:
                Designation.values.length === 0
                || Availability.values.length === 0
                || Accounts.values.length === 0,
        }),
    };
}));


export const signupRosterReducer = {
    [SignupRosterB.id.predicate]     : view,
    [SelectAccounts.id.predicate]    : view,
    [SelectAvailability.id.predicate]: view,
    [SelectDesignation.id.predicate] : view,
    [SubmitSignup.id.predicate]      : view,
};

