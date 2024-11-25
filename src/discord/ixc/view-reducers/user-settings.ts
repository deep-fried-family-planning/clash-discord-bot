import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {BackB, DeleteB, DeleteConfirmB, ForwardB, PrimaryB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {E, S} from '#src/internal/pure/effect.ts';
import {putDiscordUser} from '#src/dynamo/schema/discord-user.ts';
import {SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {LinkB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';


const saveUserRecord = (s: IxState, tz: string) => E.gen(function * () {
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
    });
});


export const UserB = PrimaryB.as(makeId(RDXK.OPEN, 'U'), {label: 'User'});
const UserSubmitB = SubmitB.as(makeId(RDXK.SUBMIT, 'U'));
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'U'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RDXK.DELETE_CONFIRM, 'U'));
const UserTzS = SingleS.as(makeId(RDXK.UPDATE, 'UTZ'), {
    placeholder: 'Timezone',
    options    : SELECT_TIMEZONES,
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Timezone = UserTzS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    const areAnyUnselected
        = Timezone.values.length === 0;

    const isSubmitting = UserSubmitB.clicked(ax);

    if (isSubmitting) {
        yield * saveUserRecord(s, Timezone.values[0]);
        yield * MenuCache.userInvalidate(s.user_id);
    }

    return {
        ...s,
        title      : 'User Settings',
        description: unset,

        status: UserSubmitB.clicked(ax)
            ? asSuccess({description: `user record created with ${Timezone.values[0]}`})
            : undefined,

        sel1: Timezone.render({disabled: isSubmitting}),

        submit: UserSubmitB.render({
            disabled: areAnyUnselected || isSubmitting,
        }),
        delete: (
            !s.user ? unset
            : Delete.render({
                disabled: true,
            })
        ),
        back: BackB.as(LinkB.id, {
            disabled: !s.user || isSubmitting,
        }),
        forward: Forward.render({
            disabled: areAnyUnselected || !isSubmitting,
        }),
    };
}));


export const userEditReducer = {
    [UserB.id.predicate]        : view,
    [UserSubmitB.id.predicate]  : view,
    [Delete.id.predicate]       : view,
    [DeleteConfirm.id.predicate]: view,
    [UserTzS.id.predicate]      : view,
};

