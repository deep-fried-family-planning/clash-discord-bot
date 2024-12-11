import {UI} from 'dfx';
import {Type} from '#src/ix/enum/enums.ts';


export const renderers = {

    [Type.BUTTON]       : UI.button,
    [Type.BUTTON_TOGGLE]: UI.button,
    [Type.BUTTON_SUBMIT]: UI.button,
    [Type.BUTTON_DELETE]: UI.button,

    [Type.STRING_SELECT]     : UI.select,
    [Type.MENTIONABLE_SELECT]: UI.mentionableSelect,
    [Type.CHANNEL_SELECT]    : UI.channelSelect,
    [Type.ROLE_SELECT]       : UI.roleSelect,
    [Type.USER_SELECT]       : UI.userSelect,

    [Type.TEXT_INPUT]: UI.textInput,

};
