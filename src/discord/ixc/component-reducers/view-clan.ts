import {PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';


const axn = {
    VIEW_CLAN_OPEN: makeId(RDXK.OPEN, 'VC'),
};


export const ViewClanB = PrimaryB.as(axn.VIEW_CLAN_OPEN).with({label: 'View Clan'});
