import {makeText} from '#src/discord/components/make-text.ts';
import {IXCTS} from '#src/internal/discord.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/store/id-build.ts';
import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/constants/route-kind.ts';


export const EDIT_DATE_TIME_MODAL_OPEN = toId({kind: RK_MODAL_OPEN, type: 'EDT'});
export const EDIT_DATE_TIME_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, type: 'EDT'});


export const EditEpochT = makeText({
    kind: RK_TEXT,
    type: 'EDE',
}, {
    label      : 'Edit Epoch',
    style      : IXCTS.SHORT,
    placeholder: 'epoch timestamp',
});


export const EditDateTimeModal = {
    title     : 'Edit Date Time',
    custom_id : EDIT_DATE_TIME_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        EditEpochT.component,
    ]),
};
