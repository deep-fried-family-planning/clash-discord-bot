import {CMP, CMP_B} from '#src/discord/helpers/re-exports.ts';
import type {DLinkButton} from '#src/discord/helpers/re-export-types.ts';

export const LBUTTON_FAQ = (url: string) => ({
    type : CMP.Button,
    style: CMP_B.Link,
    label: 'FAQ',
    url,
}) satisfies DLinkButton;
