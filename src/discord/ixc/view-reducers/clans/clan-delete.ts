import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {ClanManageB} from '#src/discord/ixc/view-reducers/clans/clan-manage.ts';

const axn = {
    CLAN_DELETE_OPEN: makeId(RDXK.OPEN, 'CM'),
};


export const ClanDeleteB = DangerB.as(axn.CLAN_DELETE_OPEN).render({label: 'Manage'});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        row1: [

        ],
        back: BackB.as(ClanManageB.id),
    };
}));


export const clanDeleteReducer = {
    [ClanDeleteB.id.predicate]: view,
};
