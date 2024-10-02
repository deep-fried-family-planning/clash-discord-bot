import type {
    APIButtonComponentWithCustomId, APIButtonComponentWithURL,
    APIMessageComponentButtonInteraction, APIBaseInteraction, APIMessageComponentInteraction,
    APIStringSelectComponent, APIMessageStringSelectInteractionData,
} from 'discord-api-types/v10';
import type {CMP} from '#src/discord/helpers/re-exports.ts';
import type {ITR, CMP_T} from '#src/discord/helpers/re-exports.ts';

export type DLinkButton = APIButtonComponentWithURL;

export type DButton = APIButtonComponentWithCustomId;
export type DIButton = APIMessageComponentButtonInteraction;
export type IButton<T extends DButton> = DIButton & {data: {custom_id: T['custom_id']}};

export type DModal = {
    custom_id : string;
    title     : string;
    components: {
        type      : CMP.ActionRow;
        components: {
            type        : CMP.TextInput;
            style       : CMP_T;
            custom_id   : string;
            label       : string;
            placeholder?: string;
            value?      : string;
            min_length? : number;
            max_length? : number;
            required?   : boolean;
        }[];
    }[];
};

export type DMenu = APIStringSelectComponent;
export type DIMenu = APIBaseInteraction<typeof ITR.MessageComponent, APIMessageStringSelectInteractionData> & Required<Pick<APIBaseInteraction<typeof ITR.MessageComponent, APIMessageStringSelectInteractionData>, 'app_permissions' | 'channel_id' | 'channel' | 'data' | 'message'>>;
export type IMenu<T extends DMenu> = DIMenu & {data: {values: T['options'][number]['value'][]}};

export type IComponent = APIMessageComponentInteraction;
