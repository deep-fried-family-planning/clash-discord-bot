import type {Col, Current, Modifiers, Origin, Row, Scope, Stage, Type} from '#src/ix/enum/enums.ts';
import type {Button, ChannelType, Emoji, SelectMenu, Snowflake, TextInput} from 'dfx/types';
import type {str} from '#src/internal/pure/types-pure.ts';


export type ButtonType =
    | typeof Type.BUTTON
    | typeof Type.BUTTON_TOGGLE
    | typeof Type.BUTTON_SUBMIT
    | typeof Type.BUTTON_DELETE;


export type SelectType =
    | typeof Type.STRING_SELECT
    | typeof Type.MENTIONABLE_SELECT
    | typeof Type.ROLE_SELECT
    | typeof Type.USER_SELECT
    | typeof Type.CHANNEL_SELECT;


export type CxId = {
    origin         : Origin;
    current        : Current;
    scope          : Scope;
    type           : Type;
    stage          : Stage;
    row            : Row;
    col            : Col;
    modifiers      : str;
    parsedModifiers: Modifiers[];
};


export type CxButton = {
    id  : CxId;
    type: ButtonType;
    from: Button;
};


export type CxSelect = {
    id     : CxId;
    type   : SelectType;
    from   : SelectMenu;
    options: {
        label       : string;
        value       : string;
        description?: string;
        emoji?      : Emoji;
        default?    : boolean;
    }[];
    values        : str[];
    channel_types : ChannelType[];
    default_values: {
        id  : Snowflake;
        type: string;
    }[];
};


export type DxText = {
    id  : CxId;
    type: typeof Type.TEXT_INPUT;
    from: TextInput;
};
