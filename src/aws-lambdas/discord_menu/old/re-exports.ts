export {
    ApplicationCommandType as CMD,
    ApplicationCommandOptionType as CMD_OP,
    InteractionType as ITR,
    MessageFlags as MSG,
    WebhookType as WBH,
    TextInputStyle as CMP_T,
    // ButtonStyle as CMP_B,
} from '@discordjs/core/http-only';

import {Discord} from 'dfx';

export type CMP = Discord.ComponentType;
export const CMP = Discord.ComponentType;
export type CMP_B = Discord.ButtonStyle;
export const CMP_B = Discord.ButtonStyle;
