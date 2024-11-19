import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';


export const LinkBE = makeButton(AXN.LINKS_ENTRY.params, {
    label: 'Links',
    style: IXCBS.SUCCESS,
});


export const InfoBE = makeButton(AXN.INFO_ENTRY.params, {
    label: 'Info',
    style: IXCBS.PRIMARY,
});


export const RosterBE = makeButton(AXN.ROSTER_ENTRY.params, {
    label: 'Rosters',
    style: IXCBS.PRIMARY,
});
