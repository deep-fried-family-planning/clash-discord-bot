import {makeButton} from '#src/discord/ixc/components/make-button.ts';
import {RDXK, RDXT} from '#src/discord/ixc/store/types.ts';
import {IXCBS} from '#src/discord/util/discord.ts';

export const LinksEntryButton = makeButton({kind: RDXK.ENTRY, type: RDXT.LINKS}, {
    label: 'Links',
    style: IXCBS.SUCCESS,
});

export const InfoEntryButton = makeButton({kind: RDXK.ENTRY, type: RDXT.INFO}, {
    label: 'Info',
    style: IXCBS.PRIMARY,
});

export const RosterEntryButton = makeButton({kind: RDXK.ENTRY, type: RDXT.ROSTER}, {
    label: 'Rosters',
    style: IXCBS.PRIMARY,
});
