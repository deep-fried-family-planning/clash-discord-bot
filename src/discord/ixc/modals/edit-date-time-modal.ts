import {makeText} from '#src/discord/ixc/components/make-text.ts';
import {IXCTS} from '#src/discord/util/discord.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/ixc/store/id-build.ts';


export const EDIT_DATE_TIME_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'EDT'});
export const EDIT_DATE_TIME_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'EDT'});


export const EditDate = makeText({
    kind: RDXK.TEXT,
    type: 'EET',
}, {
    label      : 'Edit Title',
    style      : IXCTS.SHORT,
    placeholder: 'title',
});


export const EditTime = makeText({
    kind: RDXK.TEXT,
    type: 'EED',
}, {
    label      : 'Edit Description',
    style      : IXCTS.PARAGRAPH,
    placeholder: 'description',
});


export const EditDateTimeModal = {
    title     : 'Edit Date Time',
    custom_id : EDIT_DATE_TIME_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        EditDate.component,
        EditTime.component,
    ]),
};
