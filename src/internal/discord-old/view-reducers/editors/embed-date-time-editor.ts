import {RK_OPEN} from '#src/constants/route-kind.ts';
import {asEditor} from '#src/internal/discord-old/components/component-utils.ts';
import {ForwardB, PrimaryB} from '#src/internal/discord-old/components/global-components.ts';
import {EDIT_DATE_TIME_MODAL_OPEN, EDIT_DATE_TIME_MODAL_SUBMIT, EditEpochT} from '#src/internal/discord-old/modals/edit-date-time-modal.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {IXCBS} from '#src/internal/discord.ts';
import {E} from '#src/internal/pure/effect.ts';



export const DateTimeEditorB = PrimaryB.as(makeId(RK_OPEN, 'DTE'), {
  label: 'Date/Time',
});
const DateTimeEditB          = PrimaryB.as(EDIT_DATE_TIME_MODAL_OPEN, {
  label: 'Modal',
  style: IXCBS.SUCCESS,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
  const time    = EditEpochT.fromMap(ax.cmap);
  const Forward = ForwardB.forward(ax.id);

  return {
    ...s,
    title: 'Date/Time Editor',

    editor: asEditor({
      ...s.editor,
      timestamp:
        !s.editor?.timestamp ? new Date(Date.now()).toISOString()
          : !time?.value ? s.editor.timestamp
            : new Date(parseInt(time.value)).toISOString(),
    }),

    submit : DateTimeEditB.fromMap(s.cmap) ?? DateTimeEditB.forward(ax.id),
    forward: Forward.render({
      disabled: !time?.value,
    }),
  } satisfies St;
});


export const dateTimeEditorReducer = {
  [DateTimeEditorB.id.predicate]         : view,
  [EDIT_DATE_TIME_MODAL_SUBMIT.predicate]: view,
};
