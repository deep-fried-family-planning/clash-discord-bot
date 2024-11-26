import {DangerB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {RK_OPEN} from '#src/internal/constants/route-kind.ts';


export const LinkAccountBulkB = DangerB.as(makeId(RK_OPEN, 'LAB'), {
    label: 'Bulk Links',
});
