import {makeText} from '#src/discord/ixc/components/make-text.ts';
import {IXCTS} from '#src/discord/util/discord.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/ixc/store/id-build.ts';


export const EDIT_DATE_TIME_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'EDT'});
export const EDIT_DATE_TIME_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'EDT'});


export const EditDateT = makeText({
    kind: RDXK.TEXT,
    type: 'EDT',
}, {
    label      : 'Edit Date',
    style      : IXCTS.SHORT,
    placeholder: 'yyyy-mm-dd',
});


export const EditTimeT = makeText({
    kind: RDXK.TEXT,
    type: 'EDD',
}, {
    label      : 'Edit Time',
    style      : IXCTS.SHORT,
    placeholder: 'hh:mm',
});


export const EditDateTimeModal = {
    title     : 'Edit Date Time',
    custom_id : EDIT_DATE_TIME_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        EditDateT.component,
        EditTimeT.component,
    ]),
};
