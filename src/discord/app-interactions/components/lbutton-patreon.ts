import {CMP, CMP_B} from '#src/discord/helpers/re-exports.ts';
import type {DLinkButton} from '#src/discord/helpers/re-export-types.ts';

export const LBUTTON_PATREON = {
    type : CMP.Button,
    style: CMP_B.Link,
    label: 'Patreon',
    url  : 'https://www.patreon.com/dffp',
} satisfies DLinkButton;
