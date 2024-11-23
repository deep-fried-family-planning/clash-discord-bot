import {BackB, NewB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {asEditor, unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoViewerB} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import type {SelectOption} from 'dfx/types';


const getPositions = (others: SelectOption[] = []) => [
    {
        label      : 'First',
        value      : 'first',
        description: 'Override: Make this the 1st embed of the kind',
    },
    ...others,
    {
        label      : 'Last',
        value      : 'last',
        description: 'Override: Make this the last embed of the kind',
    },
];

export const InfoViewerCreatorB = NewB.as(makeId(RDXK.OPEN, 'IVC'));
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'IVC'));
const KindS = SingleS.as(makeId(RDXK.UPDATE, 'IVCK'), {
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
const AfterS = SingleS.as(makeId(RDXK.UPDATE, 'IVCPA'), {
    options: getPositions(),
});

const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Kind = KindS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const After = AfterS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (Submit.clicked(ax)) {

    }

    return {
        ...s,
        title      : 'New Info Page',
        description: unset,

        editor: asEditor(
            s.editor
            ?? {
                title      : 'New Info Embed',
                description: 'New Info Description',
            },
        ),
        viewer: unset,
        status: unset,

        sel1: Kind,
        sel2: After,
        row3: [
            EmbedEditorB.fwd(InfoViewerCreatorB.id),
        ],

        submit: Submit.render({
            disabled:
                Submit.clicked(ax),
        }),
        back: BackB.as(InfoViewerB.id),
    };
}));


export const infoViewerCreatorReducer = {
    [InfoViewerCreatorB.id.predicate]: view,
    [Submit.id.predicate]            : view,
    [KindS.id.predicate]             : view,
    [AfterS.id.predicate]            : view,
};
