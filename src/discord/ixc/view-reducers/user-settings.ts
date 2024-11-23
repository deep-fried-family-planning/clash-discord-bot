import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {BackB, ForwardB, PrimaryB, SingleS, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';
import {SELECT_TIMES, SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';


const saveUserRecord = (s: IxState, tz: string, qs: string, qe: string) => E.gen(function * () {
    yield * putDiscordUser({
        type           : 'DiscordUser',
        pk             : s.user_id,
        sk             : 'now',
        gsi_all_user_id: s.user_id,
        version        : '1.0.0',
        created        : new Date(Date.now()),
        ...s.user,
        updated        : new Date(Date.now()),
        timezone       : yield * S.decodeUnknown(S.TimeZone)(tz),
        quiet          : `${qs}-${qe}`,
    });
});


const axn = {
    EDIT_USER_OPEN  : makeId(RDXK.OPEN, 'U'),
    EDIT_USER_TZ    : makeId(RDXK.UPDATE, 'UTZ'),
    EDIT_USER_QS    : makeId(RDXK.UPDATE, 'UQS'),
    EDIT_USER_QE    : makeId(RDXK.UPDATE, 'UQE'),
    EDIT_USER_SUBMIT: makeId(RDXK.SUBMIT, 'U'),
};


export const UserB = PrimaryB.as(axn.EDIT_USER_OPEN, {label: 'User'});
const UserTzS = SingleS.as(axn.EDIT_USER_TZ, {
    placeholder: 'Timezone',
    options    : SELECT_TIMEZONES,
});
const UserQsS = SingleS.as(axn.EDIT_USER_QS, {
    placeholder: 'Quiet Start',
    options    : SELECT_TIMES,
});
const UserQeS = SingleS.as(axn.EDIT_USER_QE, {
    placeholder: 'Quiet End',
    options    : SELECT_TIMES,
});
const UserSubmitB = SuccessB.as(axn.EDIT_USER_SUBMIT, {label: 'Submit'});
const Delete = SuccessB.as(makeId(RDXK.DELETE, 'U'), {label: 'Delete'});
const DeleteConfirm = SuccessB.as(makeId(RDXK.DELETE_CONFIRM, 'U'), {label: 'Delete'});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Timezone = UserTzS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const QuietStart = UserQsS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const QuietEnd = UserQeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    const areAnyUnselected
        = Timezone.values.length === 0
        || QuietStart.values.length === 0
        || QuietEnd.values.length === 0;

    const isSubmitting = ax.id.predicate === axn.EDIT_USER_SUBMIT.predicate;

    if (isSubmitting) {
        yield * saveUserRecord(s, Timezone.values[0], QuietStart.values[0], QuietEnd.values[0]);
    }

    return {
        ...s,
        title      : 'User Settings',
        description: unset,

        status: isSubmitting
            ? asSuccess({description: `user record created with ${Timezone.values[0]} (${QuietStart.values[0]}-${QuietEnd.values[0]})`})
            : undefined,

        sel1: Timezone.render({disabled: isSubmitting}),
        sel2: QuietStart.render({disabled: isSubmitting}),
        sel3: QuietEnd.render({disabled: isSubmitting}),

        back  : BackB.as(LinkB.id),
        submit: UserSubmitB.render({
            disabled: areAnyUnselected || isSubmitting,
        }),
        delete: Delete.render({
            disabled: true,
        }),
        forward: Forward.render({
            disabled: areAnyUnselected || !isSubmitting,
        }),
    };
}));


export const userEditReducer = {
    [UserB.id.predicate]      : view,
    [UserTzS.id.predicate]    : view,
    [UserQsS.id.predicate]    : view,
    [UserQeS.id.predicate]    : view,
    [UserSubmitB.id.predicate]: view,
};

