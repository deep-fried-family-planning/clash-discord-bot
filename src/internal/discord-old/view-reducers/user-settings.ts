import {User} from '#src/database/arch/codec.ts';
import {deleteItem, saveItem} from '#src/database/DeepFryerDB.ts';
import {asSuccess, isClicked, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, DeleteB, DeleteConfirmB, ForwardB, PrimaryB, SingleS, SubmitB} from '#src/internal/discord-old/components/global-components.ts';
import {SELECT_TIMEZONES} from '#src/internal/discord-old/constants/ix-constants.ts';
import {RK_DELETE, RK_DELETE_CONFIRM, RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/internal/discord-old/constants/route-kind.ts';
import {decodeTimezone} from '#src/internal/discord-old/dynamo/schema/common-decoding.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {LinkB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {E} from '#src/internal/pure/effect.ts';

const saveUserRecord = (s: St, tz: string) => E.gen(function* () {
  yield* saveItem(User, {
    _tag           : 'User',
    pk             : s.user_id,
    sk             : 'now',
    gsi_all_user_id: s.user_id,
    version        : 0,
    created        : undefined,
    ...s.user,
    updated        : undefined,
    timezone       : yield* decodeTimezone(tz),
  });
});

export const UserB = PrimaryB.as(makeId(RK_OPEN, 'U'), {label: 'User'});
const UserSubmitB = SubmitB.as(makeId(RK_SUBMIT, 'U'));
const Delete = DeleteB.as(makeId(RK_DELETE, 'U'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RK_DELETE_CONFIRM, 'U'));
const UserTzS = SingleS.as(makeId(RK_UPDATE, 'UTZ'), {
  placeholder: 'Timezone',
  options    : SELECT_TIMEZONES,
});

const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  let Timezone = UserTzS
    .fromMap(s.cmap)
    .setDefaultValuesIf(ax.id.predicate, selected);

  if (isClicked(UserB, ax)) {
    const tz = yield* decodeTimezone(s.user?.timezone).pipe(E.catchAll(() => E.succeed('')));

    Timezone = Timezone.render({
      options: Timezone.component.options!.map((i) => i.value === tz ? {
        ...i,
        default: true,
      } : i),
    });
  }

  const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

  const areAnyUnselected
          = Timezone.values.length === 0;

  const isSubmitting = isClicked(UserSubmitB, ax);

  if (isClicked(UserSubmitB, ax)) {
    yield* saveUserRecord(s, Timezone.values[0]);
  }

  if (isClicked(DeleteConfirm, ax)) {
    yield* deleteItem(User, s.user_id, 'now');
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
      disabled: areAnyUnselected || isSubmitting || DeleteConfirm.clicked(ax) || Delete.clicked(ax) || UserB.clicked(ax),
    }),
    delete:
      !s.user ? unset
        : Delete.clicked(ax) ? DeleteConfirm
          : DeleteConfirm.clicked(ax) ? DeleteConfirm.render({
              disabled: true,
            })
            : Delete.render({
              disabled: isSubmitting,
            }),

    back: BackB.as(LinkB.id, {
      disabled: !s.user || isSubmitting || DeleteConfirm.clicked(ax),
    }),
    forward: Forward.render({
      disabled: areAnyUnselected || !isSubmitting,
    }),
  } satisfies St;
});

export const userEditReducer = {
  [UserB.id.predicate]        : view,
  [UserSubmitB.id.predicate]  : view,
  [Delete.id.predicate]       : view,
  [DeleteConfirm.id.predicate]: view,
  [UserTzS.id.predicate]      : view,
};
