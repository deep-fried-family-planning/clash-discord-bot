import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB, DeleteB, ForwardB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {getPlayers} from '#src/discord/ixc/view-reducers/account-viewer.ts';


export const RosterViewerOptOutB = DangerB.as(makeId(RDXK.OPEN, 'ROO'), {
    label: 'Opt Out',
});

const SelectAccounts = SingleS.as(makeId(RDXK.UPDATE, 'ROO'), {
    placeholder: 'Select Accounts',
});
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'ROO'));


const getSignupsByUser = (serverId: string, rosterId: string, userId: string) => E.gen(function * () {
    return false;
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (RosterViewerOptOutB.clicked(ax)) {
        Accounts = SelectAccounts.render({
            options: yield * getPlayers(s, ax),
        });
    }

    const Roster = RosterS.fromMap(s.cmap);

    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

    const Submit = Delete.fromMap(s.cmap) ?? Delete;
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    const isSubmitting = yield * getSignupsByUser(
        s.server_id,
        Roster.values[0],
        s.user_id,
    );

    return {
        ...s,
        title      : 'Roster Opt Out',
        description: unset,

        status: Submit.clicked(ax)
            ? asSuccess({description: 'Signups deleted'})
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


export const rosterViewerOptOutReducer = {
    [RosterViewerOptOutB.id.predicate]: view,
    [SelectAccounts.id.predicate]     : view,
    [Delete.id.predicate]             : view,
};

