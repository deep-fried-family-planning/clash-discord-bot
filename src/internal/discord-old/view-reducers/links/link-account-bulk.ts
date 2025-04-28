import {RK_OPEN} from '#src/internal/discord-old/constants/route-kind.ts';
import {DangerB} from '#src/internal/discord-old/components/global-components.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';

export const LinkAccountBulkB = DangerB.as(makeId(RK_OPEN, 'LAB'), {
  label: 'Bulk Links',
});
