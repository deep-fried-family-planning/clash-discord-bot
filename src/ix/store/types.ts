import type {IxD} from '#src/internal/discord.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Col, Current, Modifiers, Origin, Row, Scope, Stage} from '#src/ix/enum/enums.ts';
import type {Type} from '#src/ix/enum/enums.ts';
import type {Button, SelectMenu, ChannelType, Emoji, Snowflake, TextInput} from 'dfx/types';
import type {ButtonType, CxButton, CxId, CxSelect, DxText, SelectType} from '#src/ix/store/types-components.ts';


export type Cx = {
    [k in str]: CxButton | CxSelect
};


export type Mx = {
    ex: Required<IxD>['message']['embeds'];
    cx: Cx;
};


export type Ax = {
    id      : CxId;
    selected: str[];
    dx: {
        [k in str]: DxText
    };
};


export type Rx = {
    ix: IxD;
    mx: Mx;
    ax: Ax;
};


export type Sx = {

};
