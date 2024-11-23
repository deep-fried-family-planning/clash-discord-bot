import {typeRx, makeId, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB, ForwardB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asSuccess} from '#src/discord/ixc/components/component-utils.ts';


const axn = {
    OPTOUT_ROSTER_OPEN           : makeId(RDXK.OPEN, 'ROO'),
    OPTOUT_ROSTER_ACCOUNTS_UPDATE: makeId(RDXK.UPDATE, 'ROO'),
    OPTOUT_ROSTER_SUBMIT         : makeId(RDXK.SUBMIT, 'ROO'),
};


export const RosterOptOutB = DangerB.as(axn.OPTOUT_ROSTER_OPEN, {
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


const optoutRoster = typeRxHelper((s, ax) => E.gen(function * () {
    if (axn.OPTOUT_ROSTER_SUBMIT.predicate === ax.id.predicate) {
        return true;
    }

    return false;
}));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (ax.id.predicate === axn.OPTOUT_ROSTER_OPEN.predicate) {
        Accounts = SelectAccounts.as(axn.OPTOUT_ROSTER_ACCOUNTS_UPDATE, {
            options: yield * getSignupsByUser(s, ax),
        });
    }

    const Roster = RosterS.fromMap(s.cmap);

    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

    const Submit = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    const isSubmitting = yield * optoutRoster(s, ax);

    return {
        ...s,
        title: 'Roster Opt Out',

        status: Submit.clicked(ax)
            ? asSuccess({description: 'Signed Up!'})
            : undefined,

        navigate: Roster.render({disabled: true}),
        sel1    : Accounts,

        back  : BackB.as(RosterViewerB.id),
        submit: Submit.render({
            disabled:
                isSubmitting
                || Accounts.values.length === 0,
        }),
        forward: Forward.render({
            disabled:
                !isSubmitting
                || Accounts.values.length === 0,
        }),
    };
}));


export const rosterOptOutReducer = {
    [RosterOptOutB.id.predicate] : view,
    [SelectAccounts.id.predicate]: view,
    [SubmitSignup.id.predicate]  : view,
};

