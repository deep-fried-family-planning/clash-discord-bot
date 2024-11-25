import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB, DeleteB, DeleteConfirmB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asConfirm, asSuccess, asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {rosterSignupCreate, rosterSignupRead} from '#src/dynamo/operations/roster-signup.ts';
import {viewUserPlayerOptions} from '#src/discord/ixc/views/user-player-options.ts';
import {filterL} from '#src/internal/pure/pure-list.ts';
import {UNAVAILABLE} from '#src/discord/ix-constants.ts';
import {dtNow} from '#src/discord/util/markdown.ts';
import {filterKV} from '#src/internal/pure/pure-kv.ts';


const getAccounts = (s: IxState, rosterId: str) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: s.user_id});
    const players = yield * Clashofclans.getPlayers(records.map((r) => r.sk));

    const signup = yield * rosterSignupRead({
        pk: rosterId,
        sk: s.user_id,
    });

    if (!signup) {
        return [];
    }

    return viewUserPlayerOptions(
        pipe(
            records,
            filterL((r) => !!signup.accounts[r.sk]),
        ),
        pipe(
            players,
            filterL((p) => !!signup.accounts[p.tag]),
        ),
    );
});


const deleteSignup = (s: IxState, rosterId: str, tag: str) => E.gen(function * () {
    const signup = yield * rosterSignupRead({pk: rosterId, sk: s.user_id});

    yield * rosterSignupCreate({
        ...signup!,
        updated : dtNow(),
        accounts: pipe(
            signup!.accounts,
            filterKV((v, k) => k !== tag),
        ),
    });
});


export const RosterViewerOptOutB = DangerB.as(makeId(RDXK.OPEN, 'RVOO'), {
    label: 'Opt Out',
});

const SelectAccounts = SingleS.as(makeId(RDXK.UPDATE, 'RVOO'), {
    placeholder: 'Select Accounts',
});
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'RVOO'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RDXK.DELETE_CONFIRM, 'RVOO'));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Roster = RosterS.fromMap(s.cmap);
    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (RosterViewerOptOutB.clicked(ax)) {
        const accounts = yield * getAccounts(s, Roster.values[0]);

        Accounts = SelectAccounts.render({
            options: accounts.length
                ? accounts
                : [{
                    label: UNAVAILABLE,
                    value: UNAVAILABLE,
                }],
        });
    }

    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);


    if (DeleteConfirm.clicked(ax)) {
        yield * deleteSignup(s, Roster.values[0], Accounts.values[0]);
    }

    // const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);


    return {
        ...s,
        title      : 'Roster Opt Out',
        description: unset,

        viewer: asViewer({
            ...s.viewer,
            footer: unset!,
        }),

        status:
            Delete.clicked(ax) ? asConfirm({description: 'Are you sure you want to delete your signup?'})
            : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Signup deleted'})
            : undefined,

        navigate: Roster.render({disabled: true}),
        sel1    : Accounts.render({
            disabled: Accounts.component.options![0].value === UNAVAILABLE,
        }),

        submit:
            Delete.clicked(ax) ? DeleteConfirm
            : DeleteConfirm.clicked(ax) ? RosterViewerOptOutB.render({
                label: 'Opt Out Another Account',
            })
            : Delete.render({
                disabled:
                    Accounts.values.length === 0,
            }),
        back: BackB.as(RosterViewerB.id),
        // forward: Forward.render({
        //     disabled:
        //         !isSubmitting
        //         || Accounts.values.length === 0,
        // }),
    };
}));


export const rosterViewerOptOutReducer = {
    [RosterViewerOptOutB.id.predicate]: view,
    [SelectAccounts.id.predicate]     : view,
    [Delete.id.predicate]             : view,
    [DeleteConfirm.id.predicate]      : view,
};

