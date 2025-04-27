import {EMOJI_ADMIN, EMOJI_BACK, EMOJI_CLOSE, EMOJI_DELETE, EMOJI_DELETE_CONFIRM, EMOJI_NEW, EMOJI_NEXT, EMOJI_SUBMIT} from '#src/constants/emoji.ts';
import {RK_BACK, RK_CLOSE, RK_DELETE, RK_FORWARD, RK_NAV, RK_NOOP, RK_SUBMIT} from '#src/constants/route-kind.ts';
import {OPTION_UNAVAILABLE} from '#src/constants/select-options.ts';
import {makeButton} from '#src/internal/discord-old/components/make-button.ts';
import {makeSelectChannel} from '#src/internal/discord-old/components/make-select-channel.ts';
import {makeSelectRole} from '#src/internal/discord-old/components/make-select-role.ts';
import {makeSelectUser} from '#src/internal/discord-old/components/make-select-user.ts';
import {makeSelect} from '#src/internal/discord-old/components/make-select.ts';
import {IXCBS} from '#src/internal/discord.ts';

export const SuccessB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {style: IXCBS.SUCCESS});
export const DangerB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {style: IXCBS.DANGER});
export const PrimaryB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {style: IXCBS.PRIMARY});
export const SecondaryB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {style: IXCBS.SECONDARY});
export const LinkB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {style: IXCBS.LINK});
export const PremiumB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {style: IXCBS.PREMIUM});

export const SingleS = makeSelect({kind: RK_NOOP, type: 'NOOP'}, {options: OPTION_UNAVAILABLE});
export const SingleChannelS = makeSelectChannel({kind: RK_NOOP, type: 'NOOP'}, {});
export const SingleRoleS = makeSelectRole({kind: RK_NOOP, type: 'NOOP'}, {});
export const SingleUserS = makeSelectUser({kind: RK_NOOP, type: 'NOOP'}, {});

export const CloseB = makeButton({kind: RK_CLOSE, type: 'T'}, {
  emoji: EMOJI_CLOSE,
  style: IXCBS.SECONDARY,
});
export const BackB = makeButton({kind: RK_BACK, type: 'T'}, {
  emoji: EMOJI_BACK,
  style: IXCBS.SECONDARY,
});
export const ForwardB = makeButton({kind: RK_FORWARD, type: 'T'}, {
  emoji: EMOJI_NEXT,
  style: IXCBS.SECONDARY,
});
export const SubmitB = makeButton({kind: RK_SUBMIT, type: 'T'}, {
  emoji: EMOJI_SUBMIT,
  style: IXCBS.SUCCESS,
});
export const EditB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {
  style: IXCBS.SUCCESS,
  label: 'Edit',
});
export const NewB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {
  style: IXCBS.SUCCESS,
  emoji: EMOJI_NEW,
});
export const AdminB = makeButton({kind: RK_NOOP, type: 'NOOP'}, {
  style: IXCBS.DANGER,
  emoji: EMOJI_ADMIN,
});
export const DeleteB = makeButton({kind: RK_DELETE, type: 'T'}, {
  style: IXCBS.DANGER,
  emoji: EMOJI_DELETE,
});
export const DeleteConfirmB = makeButton({kind: RK_DELETE, type: 'T'}, {
  style: IXCBS.DANGER,
  emoji: EMOJI_DELETE_CONFIRM,
});

export const NavSelect = makeSelect({kind: RK_NAV, type: 'T'}, {
  placeholder: 'Navigate',
});
