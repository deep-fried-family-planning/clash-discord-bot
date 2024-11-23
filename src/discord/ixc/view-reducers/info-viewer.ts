import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {InfoViewerAdminB} from '#src/discord/ixc/view-reducers/info-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {InfoViewerCreatorB} from '#src/discord/ixc/view-reducers/info-viewer-creator.ts';


export const InfoViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'IV'), {
    label: 'Info',
});
export const KindNavS = SingleS.as(makeId(RDXK.UPDATE, 'IVK'), {
    placeholder: 'Select Kind',
    options    : [
        {
            label: 'about',
            value: 'about',
        },
        {
            label: 'guide',
            value: 'guide',
        },
        {
            label: 'rule',
            value: 'rule',
        },
    ],
});
const InfoNavS = SingleS.as(makeId(RDXK.UPDATE, 'IVI'));


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);

    const Kind = KindNavS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Info = InfoNavS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title      : 'Info',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(OmbiBoardB.id),

        sel1: Kind.render({disabled: false}),
        sel2: Info.render({disabled: false}),

        submit: InfoViewerCreatorB
            .if(s.user_roles.includes(s.server!.admin as snflk))
            ?.render({
                disabled:
                    !!Kind.values.length
                    || !!Info.values.length,
            }),

        delete: InfoViewerAdminB
            .if(s.user_roles.includes(s.server!.admin as snflk)),
    };
}));


export const infoViewerReducer = {
    [InfoViewerB.id.predicate]: view,
    [KindNavS.id.predicate]   : view,
    [InfoNavS.id.predicate]   : view,
};
