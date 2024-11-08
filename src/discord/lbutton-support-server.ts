import {CMP, CMP_B} from '#src/discord/re-exports.ts';
import type {DLinkButton} from '#src/discord/re-export-types.ts';

export const LBUTTON_SUPPORT_SERVER = {
    type : CMP.Button,
    style: CMP_B.Link,
    label: 'Support Server',
    url  : 'https://discord.gg/KfpCtU2rwY',
} satisfies DLinkButton;