import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, SingleS, SubmitB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {DT, E, pipe} from '#src/internal/pure/effect.ts';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asSuccess, asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import {rosterSignupCreate, rosterSignupRead} from '#src/dynamo/operations/roster-signup.ts';
import type {bool, num, str} from '#src/internal/pure/types-pure.ts';
import {rosterRead} from '#src/dynamo/operations/roster.ts';
import {dtNow} from '#src/discord/util/markdown.ts';
import {filterL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {DRosterSignup} from '#src/dynamo/schema/discord-roster-signup.ts';
import {ROSTER_DESIGNATIONS, ROSTER_ROUNDS, UNAVAILABLE} from '#src/discord/ix-constants.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {viewUserPlayerOptions} from '#src/discord/ixc/views/user-player-options.ts';
import type {DRoster} from '#src/dynamo/schema/discord-roster.ts';
import type {SelectOption} from 'dfx/types';


const getAccounts = (s: IxState, rosterId: str) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: s.user_id});
    const players = yield * Clashofclans.getPlayers(records.map((r) => r.sk));

    const signup = yield * rosterSignupRead({
        pk: rosterId,
        sk: s.user_id,
    });

    if (!signup) {
        return viewUserPlayerOptions(records, players);
    }

    return viewUserPlayerOptions(
        pipe(
            records,
            filterL((r) => !signup.accounts[r.sk]),
        ),
        pipe(
            players,
            filterL((p) => !signup.accounts[p.tag]),
        ),
    );
});


const approximateRoundStartTimes = (s: IxState, roster: DRoster) => (o: SelectOption, idx: num) => ({
    ...o,
    description: `war start approx: ${pipe(
        DT.unsafeMakeZoned(roster.search_time, {timeZone: s.user!.timezone}),
        DT.addDuration(`${idx + 1} day`),
        DT.format({
            dateStyle: 'short',
            timeStyle: 'short',
            locale   : s.original.locale!,
        }),
    )}`,
});


const signupRoster = (
    userId: str,
    rosterId: str,
    designation: str,
    rounds: str[],
    tags: str[],
) => E.gen(function * () {
    const signup = yield * rosterSignupRead({
        pk: rosterId,
        sk: userId,
    });

    const roundsAvailable = pipe(
        rounds,
        reduceL(emptyKV<str, bool>(), (rs, r) => {
            rs[r] = true;
            return rs;
        }),
    );
    const accounts = pipe(
        tags,
        reduceL(emptyKV<str, DRosterSignup['accounts'][str]>(), (ts, t) => {
            ts[t] = pipe(
                Array(7).fill(0),
                mapL((_, idx) =>
                    roundsAvailable[`${idx}`]
                        ? {
                            availability: true,
                            designation : designation,
                        }
                        : {
                            availability: false,
                        },
                ),
            );
            return ts;
        }),
    );

    if (!signup) {
        return yield * rosterSignupCreate({
            type         : 'DiscordRosterSignup',
            pk           : rosterId,
            sk           : userId,
            gsi_roster_id: rosterId,
            gsi_user_id  : userId,
            version      : '1.0.0',
            created      : dtNow(),
            updated      : dtNow(),
            accounts     : accounts,
        });
    }

    yield * rosterSignupCreate({
        ...signup,
        accounts: {
            ...signup.accounts,
            ...accounts,
        },
        updated: dtNow(),
    });
});


export const RosterViewerSignupB = SuccessB.as(makeId(RDXK.OPEN, 'RVSU'), {
    label: 'Signup',
});
const SubmitSignup = SubmitB.as(makeId(RDXK.SUBMIT, 'RVSU'), {label: 'Signup'});

const SelectAccounts = SingleS.as(makeId(RDXK.UPDATE, 'RVSUAC'), {
    placeholder: 'Select Accounts',
});
const SelectAvailability = SingleS.as(makeId(RDXK.UPDATE, 'RVSUAV'), {
    placeholder: 'Select Availability',
    options    : ROSTER_ROUNDS,
    max_values : ROSTER_ROUNDS.length,
});
const SelectDesignation = SingleS.as(makeId(RDXK.UPDATE, 'RVSUD'), {
    placeholder: 'Select Designation',
    options    : ROSTER_DESIGNATIONS,
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Roster = RosterS.fromMap(s.cmap);

    let Availability = SelectAvailability.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (RosterViewerSignupB.clicked(ax)) {
        const roster = yield * rosterRead({
            pk: s.server_id,
            sk: Roster.values[0],
        });
        const accounts = yield * getAccounts(s, Roster.values[0]);

        Accounts = SelectAccounts.render({
            options: accounts.length
                ? accounts
                : [{
                    label: 'No Accounts Available To Signup',
                    value: UNAVAILABLE,
                }],
        });
        Availability = Availability.render({
            options: Availability.options.options!.map(approximateRoundStartTimes(s, roster)),
        });
    }
    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

    const Designation = SelectDesignation.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Submit = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;
    // const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);


    if (Submit.clicked(ax)) {
        yield * signupRoster(
            s.user_id,
            Roster.values[0],
            Designation.values[0],
            Availability.values,
            Accounts.values,
        );
    }


    return {
        ...s,
        title      : 'Roster Signup',
        description: unset,

        viewer: asViewer({
            ...s.viewer,
            footer: unset!,
        }),

        navigate: Roster.render({disabled: true}),
        sel1    : Accounts.render({
            disabled:
                Accounts.component.options![0].value === UNAVAILABLE
                || Submit.clicked(ax),
        }),
        sel2: Availability.render({
            disabled: Submit.clicked(ax),
        }),
        sel3: Designation.render({
            disabled: Submit.clicked(ax),
        }),

        status:
            Submit.clicked(ax)
                ? asSuccess({description: 'Signed Up!'})
                : undefined,

        submit:
            Submit.clicked(ax)
                ? RosterViewerSignupB.render({
                    label: 'Signup Another Account',
                })
                : Submit.render({
                    disabled:
                        Designation.values.length === 0
                        || Availability.values.length === 0
                        || Accounts.values.length === 0,
                }),

        back: BackB.as(RosterViewerB.id),
        // forward: Forward.render({
        //     disabled:
        //         !Submit.clicked(ax)
        //         || Designation.values.length === 0
        //         || Availability.values.length === 0
        //         || Accounts.values.length === 0,
        // }),
    };
}));


export const rosterViewerSignupReducer = {
    [RosterViewerSignupB.id.predicate]: view,
    [SelectAccounts.id.predicate]     : view,
    [SelectAvailability.id.predicate] : view,
    [SelectDesignation.id.predicate]  : view,
    [SubmitSignup.id.predicate]       : view,
};

