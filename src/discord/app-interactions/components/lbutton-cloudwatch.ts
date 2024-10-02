import type {DLinkButton} from '#src/discord/helpers/re-export-types.ts';
import {CMP, CMP_B} from '#src/discord/helpers/re-exports.ts';
import {buildCloudWatchLink} from '#src/utils/links.ts';

export const LBUTTON_CLOUDWATCH = () => ({
    type : CMP.Button,
    style: CMP_B.Link,
    label: 'View CloudWatch Logs',
    url  : buildCloudWatchLink(),
}) satisfies DLinkButton;
