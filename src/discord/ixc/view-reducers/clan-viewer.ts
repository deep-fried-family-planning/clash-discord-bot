import {PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';


const axn = {
    VIEW_CLAN_OPEN: makeId(RDXK.OPEN, 'VC'),
};


export const ViewClanB = PrimaryB.as(axn.VIEW_CLAN_OPEN).render({label: 'View Clan'});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


export const clanViewerReducer = {
    [axn.VIEW_CLAN_OPEN.predicate]: view,
};
