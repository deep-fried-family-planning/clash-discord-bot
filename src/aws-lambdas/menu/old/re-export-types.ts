import type {
    APIButtonComponentWithCustomId, APIButtonComponentWithURL,
    APIMessageComponentButtonInteraction, APIBaseInteraction, APIMessageComponentInteraction,
    APIStringSelectComponent, APIMessageStringSelectInteractionData,
} from '@discordjs/core/http-only';
import type {ITR} from '#src/aws-lambdas/menu/old/re-exports.ts';

export type DLinkButton = APIButtonComponentWithURL;

export type DButton = APIButtonComponentWithCustomId;
export type DIButton = APIMessageComponentButtonInteraction;
export type IButton<T extends DButton> = DIButton & {data: {custom_id: T['custom_id']}};

export type DMenu = APIStringSelectComponent;
export type DIMenu = APIBaseInteraction<typeof ITR.MessageComponent, APIMessageStringSelectInteractionData> & Required<Pick<APIBaseInteraction<typeof ITR.MessageComponent, APIMessageStringSelectInteractionData>, 'app_permissions' | 'channel_id' | 'channel' | 'data' | 'message'>>;
export type IMenu<T extends DMenu> = DIMenu & {data: {values: T['options'][number]['value'][]}};

export type IComponent = APIMessageComponentInteraction;
