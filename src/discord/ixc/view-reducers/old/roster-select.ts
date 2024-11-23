import {typeRx, typeRxHelper, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';


const getRosters = typeRxHelper((s, ax) => E.gen(function * () {
    return [{
        value: 'NOOP',
        label: 'NOOP',
    }];
}));


const axn = {
    SELECT_ROSTER_OPEN  : makeId(RDXK.INIT, 'SER'),
    SELECT_ROSTER_UPDATE: makeId(RDXK.UPDATE, 'SER'),
};


export const SelectRosterB = PrimaryB.as(axn.SELECT_ROSTER_OPEN, {
    label: 'Select Roster',
});

const RosterS = SingleS.as(axn.SELECT_ROSTER_UPDATE, {
    placeholder: 'Select Roster',
    options    : [{
        value: 'NOOP',
        label: 'NOOP',
    }],
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    let Roster = RosterS.fromMap(s.cmap);

    if (ax.id.predicate === axn.SELECT_ROSTER_OPEN.predicate) {
        Roster = Roster.render({
            options: yield * getRosters(s, ax),
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
    };
}));


export const rosterSelectReducer = {
    [SelectRosterB.id.predicate]: view,
    [RosterS.id.predicate]      : view,
};

