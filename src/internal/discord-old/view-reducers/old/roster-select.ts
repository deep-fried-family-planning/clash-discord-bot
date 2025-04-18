import {RK_INIT, RK_UPDATE} from '#src/constants/route-kind.ts';
import {ForwardB, PrimaryB, SingleS} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';



const getRosters = () => E.gen(function* () {
  return [{
    value: 'NOOP',
    label: 'NOOP',
  }];
});


export const SelectRosterB = PrimaryB.as(makeId(RK_INIT, 'SER'), {
  label: 'Select Roster',
});

const RosterS = SingleS.as(makeId(RK_UPDATE, 'SER'), {
  placeholder: 'Select Roster',
  options    : [{
    value: 'NOOP',
    label: 'NOOP',
  }],
});


const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  let Roster = RosterS.fromMap(s.cmap);

  if (SelectRosterB.clicked(ax)) {
    Roster = Roster.render({
      options: yield * getRosters(),
    });
  }

  Roster = Roster.setDefaultValuesIf(ax.id.predicate, selected);

  const Forward
          = ForwardB.fromMap(s.cmap)
    ?? ForwardB.forward(ax.id);

  return {
    ...s,
    title  : 'Select Roster',
    sel1   : Roster,
    forward: Forward
      .addForward(Roster.values[0])
      .render({
        disabled: Roster.values.length === 0,
      }),
  } satisfies St;
});


export const rosterSelectReducer = {
  [SelectRosterB.id.predicate]: view,
  [RosterS.id.predicate]      : view,
};
