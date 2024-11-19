import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {RDXK, RDXT} from '#src/discord/ixc/store/types.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {makeSelect} from '#src/discord/ixc/components/make-select.ts';


export const CloseB = makeButton({kind: RDXK.CLOSE, type: RDXT.CLOSE}, {
    label: 'Close',
    style: IXCBS.SECONDARY,
});

export const BackB = makeButton({kind: RDXK.BACK, type: RDXT.BACK}, {
    label: 'Back',
    style: IXCBS.SECONDARY,
});

export const NextB = makeButton({kind: RDXK.NEXT, type: RDXT.NEXT}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const ForwardB = makeButton({kind: RDXK.FORWARD, type: RDXT.FORWARD}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const SubmitB = makeButton({kind: RDXK.SUBMIT, type: RDXT.SUBMIT}, {
    label: 'Submit',
    style: IXCBS.SUCCESS,
});

export const DeleteB = makeButton({kind: RDXK.SUBMIT, type: RDXT.SUBMIT}, {
    label: 'Delete',
    style: IXCBS.DANGER,
});

export const NavSelect = makeSelect({kind: RDXK.NAV, type: RDXT.NAV}, {
    placeholder: 'Navigate',
});
