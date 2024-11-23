import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, ForwardB, SingleS, SubmitB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {DT, E, pipe} from '#src/internal/pure/effect.ts';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {getPlayers} from '#src/discord/ixc/view-reducers/account-viewer.ts';
import {rosterSignupCreate, rosterSignupRead} from '#src/dynamo/operations/roster-signup.ts';
import type {bool, str} from '#src/internal/pure/types-pure.ts';
import {rosterRead} from '#src/dynamo/operations/roster.ts';
import {dtNow} from '#src/discord/util/markdown.ts';
import {mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {DRosterSignup} from '#src/dynamo/discord-roster-signup.ts';


export const RosterSignupB = SuccessB.as(makeId(RDXK.OPEN, 'RS'), {
    label: 'Signup',
});
const SubmitSignup = SubmitB.as(makeId(RDXK.SUBMIT, 'RS'), {label: 'Signup'});

const SelectAccounts = SingleS.as(makeId(RDXK.UPDATE, 'RSAC'), {
    placeholder: 'Select Accounts',
});
const SelectAvailability = SingleS.as(makeId(RDXK.UPDATE, 'RSA'), {
    placeholder: 'Select Availability',
    options    : [
        {label: 'Round 1', value: '0', default: true},
        {label: 'Round 2', value: '1', default: true},
        {label: 'Round 3', value: '2', default: true},
        {label: 'Round 4', value: '3', default: true},
        {label: 'Round 5', value: '4', default: true},
        {label: 'Round 6', value: '5', default: true},
        {label: 'Round 7', value: '6', default: true},
    ],
    max_values: 7,
    min_values: 1,
});
const SelectDesignation = SingleS.as(makeId(RDXK.UPDATE, 'RSD'), {
    placeholder: 'Select Designation',
    options    : [{
        label  : 'Default',
        value  : 'default',
        default: true,
    }, {
        label      : 'Designated 2 Star',
        value      : 'dts',
        description: '2 star higher bases as a lower TH account',
    }],
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


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Roster = RosterS.fromMap(s.cmap);

    let Availability = SelectAvailability.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    let Accounts = SelectAccounts.fromMap(s.cmap);

    if (ax.id.predicate === RosterSignupB.id.predicate) {
        const roster = yield * rosterRead({
            pk: s.server_id,
            sk: Roster.values[0],
        });

        Accounts = SelectAccounts.render({
            options: yield * getPlayers(s, ax),
        });
        Availability = Availability.render({
            options: Availability.options.options!.map((o, idx) => ({
                ...o,
                description: `war start approx: ${pipe(
                    DT.unsafeMakeZoned(roster.search_time, {
                        timeZone: s.user!.timezone,
                    }),
                    DT.addDuration(`${idx + 1} day`),
                    DT.format({
                        dateStyle: 'short',
                        timeStyle: 'short',
                        locale   : s.original.locale!,
                    }),
                )}`,
            })),
        });
    }
    Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

    const Designation = SelectDesignation.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Submit = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);


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

        navigate: Roster.render({disabled: true}),
        sel1    : Accounts,
        sel2    : Availability,
        sel3    : Designation,

        status:
            Submit.clicked(ax)
                ? asSuccess({description: 'Signed Up!'})
                : undefined,

        back  : BackB.as(RosterViewerB.id),
        submit: Submit.render({
            disabled:
                Submit.clicked(ax)
                || Designation.values.length === 0
                || Availability.values.length === 0
                || Accounts.values.length === 0,
        }),
        forward: Forward.render({
            disabled:
                !Submit.clicked(ax)
                || Designation.values.length === 0
                || Availability.values.length === 0
                || Accounts.values.length === 0,
        }),
    };
}));


export const rosterSignupReducer = {
    [RosterSignupB.id.predicate]     : view,
    [SelectAccounts.id.predicate]    : view,
    [SelectAvailability.id.predicate]: view,
    [SelectDesignation.id.predicate] : view,
    [SubmitSignup.id.predicate]      : view,
};

