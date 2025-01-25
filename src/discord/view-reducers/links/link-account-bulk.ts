import {RK_OPEN} from '#src/constants/route-kind.ts';
import {DangerB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';



export const LinkAccountBulkB = DangerB.as(makeId(RK_OPEN, 'LAB'), {
  label: 'Bulk Links',
});
