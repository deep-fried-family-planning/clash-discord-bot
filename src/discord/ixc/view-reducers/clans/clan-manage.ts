import {BackB, DangerB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {ClanDeleteB} from '#src/discord/ixc/view-reducers/clans/clan-delete.ts';
import {ClansB} from '#src/discord/ixc/view-reducers/board-info.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';


const axn = {
    CLAN_MANAGE_OPEN: makeId(RDXK.OPEN, 'CM'),
};


export const ClanManageB = DangerB.as(axn.CLAN_MANAGE_OPEN).render({label: 'Manage'});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        row1: [
            EmbedEditorB.fwd(ClanManageB.id),
            ClanDeleteB,
        ],
        back: BackB.as(ClansB.id),
    };
}));


export const clanManageReducer = {
    [axn.CLAN_MANAGE_OPEN.predicate]: view,
};
