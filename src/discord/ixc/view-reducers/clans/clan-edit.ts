import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {ClanManageB} from '#src/discord/ixc/view-reducers/clans/clan-manage.ts';

const axn = {
    CLAN_EDIT_OPEN: makeId(RDXK.OPEN, 'CE'),
};


export const ClanEditB = DangerB.as(axn.CLAN_EDIT_OPEN).render({label: 'Manage'});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        row1: [
            EmbedEditorB.fwd(ClanEditB.id),
        ],
        back: BackB.as(ClanManageB.id),
    };
}));


export const clanEditReducer = {
    [ClanEditB.id.predicate]: view,
};
