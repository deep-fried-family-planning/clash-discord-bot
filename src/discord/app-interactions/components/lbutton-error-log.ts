import type {DLinkButton} from '#src/discord/helpers/re-export-types.ts';
import {CMP, CMP_B} from '#src/discord/helpers/re-exports.ts';

export const LBUTTON_ERROR_LOG = (channel_id: string, message_id: string) => ({
    type : CMP.Button,
    style: CMP_B.Link,
    label: 'Discord Error Log',
    url  : `https://discord.com/channels/1283847240061947964/${channel_id}/${message_id}`,
}) satisfies DLinkButton;
