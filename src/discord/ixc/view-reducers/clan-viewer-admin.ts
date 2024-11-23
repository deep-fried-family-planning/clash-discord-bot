import {BackB, DangerB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {ClanViewerB} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {asConfirm} from '#src/discord/ixc/components/component-utils.ts';


export const ClanViewerAdminB = DangerB.as(makeId(RDXK.OPEN, 'VCA'), {
    label: 'Manage Clan',
});
const DeleteB = DangerB.as(makeId(RDXK.DELETE, 'VCA'), {
    label: 'Delete',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const Delete = DeleteB.fromMap(s.cmap) ?? DeleteB;

    const isDeleting = Delete.clicked(ax);

    return {
        ...s,
        status: isDeleting ? asConfirm({
            title      : 'Delete Clan',
            description: 'Are you sure?',
        }) : undefined,
        row1: [
            EmbedEditorB.fwd(ClanViewerAdminB.id),
        ],
        delete: Delete.render({
            label: 'Delete Clan',
        }),
        back: BackB.as(ClanViewerB.id),
    };
}));


export const clanViewerAdminReducer = {
    [ClanViewerAdminB.id.predicate]: view,

    [DeleteB.id.predicate]: view,
};
