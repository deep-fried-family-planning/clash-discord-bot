import {typeRx, makeId} from '#src/discord/ixc/reducers/type-rx.ts';
import {type IxState, RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {QuietEndSelector, QuietStartSelector, TimezoneS} from '#src/discord/ixc/components/components.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {putDiscordUser} from '#src/dynamo/discord-user.ts';


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
    EDIT_USER_OPEN   : makeId(RDXK.INIT, 'U'),
    EDIT_USER_TZ     : makeId(RDXK.UPDATE, 'UTZ'),
    EDIT_USER_QS     : makeId(RDXK.UPDATE, 'UQS'),
    EDIT_USER_QE     : makeId(RDXK.UPDATE, 'UQE'),
    EDIT_USER_SUBMIT : makeId(RDXK.SUBMIT, 'U'),
    EDIT_USER_FORWARD: makeId(RDXK.FORWARD, 'U'),
};


export const UserB = PrimaryB.as(axn.EDIT_USER_OPEN, {label: 'User'});
const UserTzS = TimezoneS.as(axn.EDIT_USER_TZ);
const UserQsS = QuietStartSelector.as(axn.EDIT_USER_QS);
const UserQeS = QuietEndSelector.as(axn.EDIT_USER_QE);
const UserSubmitB = SuccessB.as(axn.EDIT_USER_SUBMIT, {label: 'Submit'});
const UserForwardB = ForwardB.as(axn.EDIT_USER_FORWARD, {label: 'Next'});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Timezone = UserTzS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const QuietStart = UserQsS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const QuietEnd = UserQeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Forward = UserForwardB.fromMap(s.cmap) ?? UserForwardB.forward(ax.id);

    const areAnyUnselected = [Timezone.values, QuietStart.values, QuietEnd.values].flat().length > 0;
    const isSubmitting = ax.id.predicate === axn.EDIT_USER_SUBMIT.predicate;

    if (isSubmitting) {
        yield * saveUserRecord(s, Timezone.values[0], QuietStart.values[0], QuietEnd.values[0]);
    }

    return {
        ...s,
        title : 'Edit User Settings',
        select: isSubmitting
            ? jsonEmbed({
                timezone  : Timezone.values[0],
                quietStart: QuietStart.values[0],
                quietEnd  : QuietEnd.values[0],
            })
            : undefined,
        status: isSubmitting
            ? {description: `user record created with ${Timezone.values[0]} (${QuietStart.values[0]}-${QuietEnd.values[0]})`}
            : undefined,
        sel1   : Timezone.render({disabled: isSubmitting}),
        sel2   : QuietStart.render({disabled: isSubmitting}),
        sel3   : QuietEnd.render({disabled: isSubmitting}),
        submit : UserSubmitB.render({disabled: areAnyUnselected || isSubmitting}),
        forward: Forward.render({disabled: areAnyUnselected || !isSubmitting}),
    };
}));


export const editUserReducer = {
    [UserB.id.predicate]       : view,
    [UserTzS.id.predicate]     : view,
    [UserQsS.id.predicate]     : view,
    [UserQeS.id.predicate]     : view,
    [UserSubmitB.id.predicate] : view,
    [UserForwardB.id.predicate]: view,
};

