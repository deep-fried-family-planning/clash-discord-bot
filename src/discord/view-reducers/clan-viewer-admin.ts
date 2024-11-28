import {AdminB, BackB, DeleteB, DeleteConfirmB, ForwardB, SingleChannelS, SingleS, SubmitB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {ClanViewerB, ClanViewerSelector} from '#src/discord/view-reducers/clan-viewer.ts';
import {EmbedEditorB} from '#src/discord/view-reducers/editors/embed-editor.ts';
import {asConfirm, asEditor, asSuccess, unset} from '#src/discord/components/component-utils.ts';
import {RK_DELETE, RK_DELETE_CONFIRM, RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {PLACEHOLDER_CLAN_TYPE, PLACEHOLDER_WAR_COUNTDOWN} from '#src/constants/placeholder.ts';
import {LABEL_TITLE_ADMIN_CLAN} from '#src/constants/label.ts';


export const ClanViewerAdminB = AdminB.as(makeId(RK_OPEN, 'CVA'), {
});
const Submit = SubmitB.as(makeId(RK_SUBMIT, 'CVA'));
const Delete = DeleteB.as(makeId(RK_DELETE, 'CVA'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RK_DELETE_CONFIRM, 'CVA'));
const ClanTypeS = SingleS.as(makeId(RK_UPDATE, 'CVAT'), {
    placeholder: PLACEHOLDER_CLAN_TYPE,
});
const CountdownS = SingleChannelS.as(makeId(RK_UPDATE, 'CVAC'), {
    placeholder: PLACEHOLDER_WAR_COUNTDOWN,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const ClanType = ClanTypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Countdown = CountdownS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Clan = ClanViewerSelector.fromMap(s.cmap);

    return {
        ...s,
        title      : LABEL_TITLE_ADMIN_CLAN,
        description: unset,

        viewer: unset,
        editor: asEditor(
            s.viewer
            ?? s.editor,
        ),
        status:
            Submit.clicked(ax) ? asSuccess({description: 'Clan Edited'})
            : Delete.clicked(ax) ? asConfirm({description: 'Are you sure?'})
            : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Not implemented yet...'})
            : undefined,

        navigate: Clan.render({disabled: true}),
        sel1    : ClanType,
        sel2    : Countdown,
        row3    : [
            EmbedEditorB.fwd(ClanViewerAdminB.id),
        ],

        back  : BackB.as(ClanViewerB.id),
        submit: Submit.render({
            disabled:
                !Submit.clicked(ax)
                || !DeleteConfirm.clicked(ax)
                || ClanType.values.length === 0
                || Countdown.values.length === 0,
        }),
        delete: (
            Delete.clicked(ax)
                ? DeleteConfirm
                : Delete
        ).render({
            disabled:
                !Submit.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || ClanType.values.length === 0
                || Countdown.values.length === 0,
        }),
        forward: ForwardB.fwd(ClanViewerB.id),
    } satisfies St;
});


export const clanViewerAdminReducer = {
    [ClanViewerAdminB.id.predicate]: view,
    [Submit.id.predicate]          : view,
    [Delete.id.predicate]          : view,
    [DeleteConfirm.id.predicate]   : view,
    [ClanTypeS.id.predicate]       : view,
    [CountdownS.id.predicate]      : view,
};
