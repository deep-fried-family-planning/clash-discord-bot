import {CMP, CMP_B} from '#src/discord/re-exports.ts';
import type {DLinkButton} from '#src/discord/re-export-types.ts';

export const LBUTTON_PATREON = {
    type : CMP.Button,
    style: CMP_B.Link,
    label: 'Patreon',
    url  : 'https://www.patreon.com/dffp',
} satisfies DLinkButton;
