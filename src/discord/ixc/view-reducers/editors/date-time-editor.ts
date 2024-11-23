import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {
    EDIT_DATE_TIME_MODAL_OPEN,
    EDIT_DATE_TIME_MODAL_SUBMIT,
    EditDateT, EditTimeT,
} from '#src/discord/ixc/modals/edit-date-time-modal.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {asEditor} from '#src/discord/ixc/components/component-utils.ts';


const axn = {
    EDIT_DATE_TIME_OPEN: makeId(RDXK.OPEN, 'DTE'),
};


export const DateTimeEditorB = PrimaryB.as(axn.EDIT_DATE_TIME_OPEN, {
    label: 'Date/Time',
});
const DateTimeEditB = PrimaryB.as(EDIT_DATE_TIME_MODAL_OPEN, {
    label: 'Modal',
    style: IXCBS.SUCCESS,
});


const view = typeRx((s, ax) => E.gen(function * () {
    const date = EditDateT.fromMap(ax.cmap);
    const time = EditTimeT.fromMap(ax.cmap);
    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    return {
        ...s,
        title : 'Date/Time Editor',
        editor: asEditor({
            title      : s.editor!.title!,
            description: s.editor!.description!,
            color      : s.editor!.color!,
            timestamp:
                (date?.value && time?.value) ? new Date(Date.now()).toISOString()
                : s.editor!.timestamp!,
        }),
        submit : DateTimeEditB.fromMap(s.cmap) ?? DateTimeEditB.forward(ax.id),
        forward: Forward.render({
            disabled: !date?.value && !time?.value,
        }),
    };
}));


export const dateTimeEditorReducer = {
    [axn.EDIT_DATE_TIME_OPEN.predicate]    : view,
    [EDIT_DATE_TIME_MODAL_OPEN.predicate]  : view,
    [EDIT_DATE_TIME_MODAL_SUBMIT.predicate]: view,
};
