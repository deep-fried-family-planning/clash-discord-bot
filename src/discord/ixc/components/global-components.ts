import {makeButton, makeSelect} from '#src/discord/ixc/components/make-components.ts';
import {RDXK, RDXT} from '#src/discord/ixc/store/types.ts';
import {IXCBS} from '#src/discord/util/discord.ts';

export const CloseButton = makeButton({kind: RDXK.CLOSE, type: RDXT.CLOSE}, {
    label: 'Close',
    style: IXCBS.SECONDARY,
});

export const BackButton = makeButton({kind: RDXK.BACK, type: RDXT.BACK}, {
    label: 'Back',
    style: IXCBS.SECONDARY,
});

export const NextButton = makeButton({kind: RDXK.NEXT, type: RDXT.NEXT}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const ForwardButton = makeButton({kind: RDXK.FORWARD, type: RDXT.FORWARD}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const SubmitButton = makeButton({kind: RDXK.SUBMIT, type: RDXT.SUBMIT}, {
    label: 'Submit',
    style: IXCBS.SUCCESS,
});

export const DeleteButton = makeButton({kind: RDXK.SUBMIT, type: RDXT.SUBMIT}, {
    label: 'Delete',
    style: IXCBS.DANGER,
});

export const NavSelect = makeSelect({kind: RDXK.NAV, type: RDXT.NAV}, {
    placeholder: 'Navigate',
});
