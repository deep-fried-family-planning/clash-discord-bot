import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {IXCBS, IXCTS} from '#src/discord/util/discord.ts';
import {makeSelect} from '#src/discord/ixc/components/make-select.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {makeText} from '#src/discord/ixc/components/make-text.ts';


export const CloseB = makeButton({kind: RDXK.CLOSE, type: 'T'}, {
    label: 'Close',
    style: IXCBS.SECONDARY,
});

export const BackB = makeButton({kind: RDXK.BACK, type: 'T'}, {
    label: 'Back',
    style: IXCBS.SECONDARY,
});

export const NextB = makeButton({kind: RDXK.NEXT}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const ForwardB = makeButton({kind: RDXK.FORWARD, type: 'T'}, {
    label: 'Next',
    style: IXCBS.PRIMARY,
});

export const SubmitB = makeButton({kind: RDXK.SUBMIT}, {
    label: 'Submit',
    style: IXCBS.SUCCESS,
});

export const DeleteB = makeButton({kind: RDXK.SUBMIT}, {
    label: 'Delete',
    style: IXCBS.DANGER,
});

export const NavSelect = makeSelect({kind: RDXK.NAV, type: 'T'}, {
    placeholder: 'Navigate',
});


export const ModalTransmitter = makeText({kind: RDXK.MODAL_TRANSMITTER, type: 'T'}, {
    label     : 'DO NOT TOUCH',
    style     : IXCTS.SHORT,
    max_length: 4000,
});


export const SuccessB = makeButton(AXN.NOOP, {style: IXCBS.SUCCESS});
export const DangerB = makeButton(AXN.NOOP, {style: IXCBS.DANGER});
export const PrimaryB = makeButton(AXN.NOOP, {style: IXCBS.PRIMARY});
export const SecondaryB = makeButton(AXN.NOOP, {style: IXCBS.SECONDARY});
export const LinkB = makeButton(AXN.NOOP, {style: IXCBS.LINK});
export const PremiumB = makeButton(AXN.NOOP, {style: IXCBS.PREMIUM});

export const SingleS = makeSelect(AXN.NOOP, {options: [{value: 'INVALID', label: 'INVALID'}]});
