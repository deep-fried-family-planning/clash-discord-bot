import {SELECT_ACCOUNT_TYPE} from '#src/internal/discord-old/constants/ix-constants.ts';
import {LABEL_ADMIN_LINK, LABEL_LINK, LABEL_PLAYER_TAG, LABEL_TITLE_ADMIN_LINK, LABEL_TRY_AGAIN} from '#src/internal/discord-old/constants/label.ts';
import {PLACEHOLDER_ACCOUNT_TYPE, PLACEHOLDER_SELECT_USER} from '#src/internal/discord-old/constants/placeholder.ts';
import {RK_OPEN, RK_UPDATE} from '#src/internal/discord-old/constants/route-kind.ts';
import {oneofus} from '#src/discord/commands/oneofus.ts';
import {asFailure, asSuccess, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, DangerB, ForwardB, SingleS, SingleUserS, SuccessB} from '#src/internal/discord-old/components/global-components.ts';
import {LINK_ACCOUNT_ADMIN_MODAL_OPEN, LINK_ACCOUNT_ADMIN_MODAL_SUBMIT} from '#src/internal/discord-old/modals/link-account-admin-modal.ts';
import {PlayerTagT} from '#src/internal/discord-old/modals/link-account-modal.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {LinkB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {E} from '#src/internal/pure/effect.ts';

export const LinkAccountAdminB = DangerB.as(makeId(RK_OPEN, 'LAA'), {
  label: LABEL_ADMIN_LINK,
});
const TypeToModalB = SuccessB.as(LINK_ACCOUNT_ADMIN_MODAL_OPEN, {
  label: LABEL_PLAYER_TAG,
});
const TypeS = SingleS.as(makeId(RK_UPDATE, 'LAAT'), {
  placeholder: PLACEHOLDER_ACCOUNT_TYPE,
  options    : SELECT_ACCOUNT_TYPE,
});
const UserS = SingleUserS.as(makeId(RK_UPDATE, 'LAAU'), {
  placeholder: PLACEHOLDER_SELECT_USER,
});

const view1 = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
  const User = UserS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

  return {
    ...s,
    title      : LABEL_TITLE_ADMIN_LINK,
    description: unset,

    viewer: unset,
    editor: unset,
    status: unset,

    sel1: Type,
    sel2: User,

    forward: TypeToModalB.withData(Type.values).render({
      disabled:
        Type.values.length === 0
        || User.values.length === 0,
    }),
    back: BackB.as(LinkB.id),
  } satisfies St;
});

const view2 = (s: St, ax: Ax) => E.gen(function* () {
  const tag = PlayerTagT.fromMap(ax.cmap);
  const Type = TypeS.fromMap(s.cmap);
  const User = UserS.fromMap(s.cmap);

  const message = yield* oneofus(s.original, {
    player_tag  : tag?.component.value ?? '',
    api_token   : 'admin',
    account_kind: Type.values[0],
    discord_user: User.values[0],
  }).pipe(
    E.catchTag('DeepFryerSlashUserError', (e) => E.succeed({
      type  : 'ReturnableError',
      embeds: [{
        description: e.issue,
      }],
    })),
    E.catchTag('DeepFryerClashError', (e) => E.succeed({
      type  : 'ReturnableError',
      embeds: [{
        // @ts-expect-error clashperk lib types
        description: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
      }],
    })),
  );

  return {
    ...s,
    title      : LABEL_TITLE_ADMIN_LINK,
    description: unset,

    viewer: unset,
    editor: unset,
    status: 'type' in message
      ? asFailure(message.embeds[0])
      : asSuccess(message.embeds[0]),

    back: SuccessB.as(LinkAccountAdminB.id).render({
      label: 'type' in message
        ? LABEL_TRY_AGAIN
        : LABEL_LINK,
    }),
    forward: ForwardB.as(LinkB.id),
  } satisfies St;
});

export const linkAccountAdminReducer = {
  [LinkAccountAdminB.id.predicate]           : view1,
  [TypeS.id.predicate]                       : view1,
  [UserS.id.predicate]                       : view1,
  [LINK_ACCOUNT_ADMIN_MODAL_SUBMIT.predicate]: view2,
};
