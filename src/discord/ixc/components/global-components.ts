import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {makeSelect} from '#src/discord/ixc/components/make-select.ts';
import {makeSelectUser} from '#src/discord/ixc/components/make-select-user.ts';
import {makeSelectChannel} from '#src/discord/ixc/components/make-select-channel.ts';
import {makeSelectRole} from '#src/discord/ixc/components/make-select-role.ts';


export const SuccessB = makeButton({kind: RDXK.NOOP, type: 'NOOP'}, {style: IXCBS.SUCCESS});
export const DangerB = makeButton({kind: RDXK.NOOP, type: 'NOOP'}, {style: IXCBS.DANGER});
export const PrimaryB = makeButton({kind: RDXK.NOOP, type: 'NOOP'}, {style: IXCBS.PRIMARY});
export const SecondaryB = makeButton({kind: RDXK.NOOP, type: 'NOOP'}, {style: IXCBS.SECONDARY});
export const LinkB = makeButton({kind: RDXK.NOOP, type: 'NOOP'}, {style: IXCBS.LINK});
export const PremiumB = makeButton({kind: RDXK.NOOP, type: 'NOOP'}, {style: IXCBS.PREMIUM});


export const SingleS = makeSelect({kind: RDXK.NOOP, type: 'NOOP'}, {
    options: [{value: 'INVALID', label: 'INVALID'}],
});
export const SingleChannelS = makeSelectChannel({kind: RDXK.NOOP, type: 'NOOP'}, {});
export const SingleRoleS = makeSelectRole({kind: RDXK.NOOP, type: 'NOOP'}, {});
export const SingleUserS = makeSelectUser({kind: RDXK.NOOP, type: 'NOOP'}, {});


export const CloseB = makeButton({kind: RDXK.CLOSE, type: 'T'}, {
    label: 'Close',
    style: IXCBS.SECONDARY,
});

export const BackB = makeButton({kind: RDXK.BACK, type: 'T'}, {
    label: 'Back',
    style: IXCBS.SECONDARY,
});

export const ForwardB = makeButton({kind: RDXK.FORWARD, type: 'T'}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const SubmitB = makeButton({kind: RDXK.SUBMIT, type: 'T'}, {
    label: 'Submit',
    style: IXCBS.SUCCESS,
});

export const NavSelect = makeSelect({kind: RDXK.NAV, type: 'T'}, {
    placeholder: 'Navigate',
});


