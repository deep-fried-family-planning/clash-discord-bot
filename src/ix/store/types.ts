import type {IxD} from '#src/internal/discord.ts';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {Col, Current, Modifiers, Origin, Row, Scope, Stage} from '#src/ix/enum/enums.ts';
import type {Type} from '#src/ix/enum/enums.ts';
import type {Button, SelectMenu, ChannelType, Emoji, Snowflake, TextInput, Embed, EmbedField} from 'dfx/types';
import type {ButtonType, CxButton, CxId, CxSelect, DxText, SelectType} from '#src/ix/store/types-components.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {MadeSelect} from '#src/discord/components/make-select.ts';
import type {MadeButton} from '#src/discord/components/make-button.ts';
import type {ComponentMapItem} from '#src/discord/store/derive-state.ts';


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
    rx: Rx;

    user  : DUser;
    server: DServer;
};


export type Tx = {
    viewer?: Embed;
    editor?: Embed;

    // submit?: ;


    server_id : Snowflake;
    user_id   : Snowflake;
    user_roles: Snowflake[];
    server?   : DServer | undefined;
    user?     : DUser | undefined;

    reference: Record<str, str>;

    system?     : EmbedField[] | und;
    type?       : str | und;
    title?      : str | und;
    description?: str | und;
    info?       : Embed | und;
    select?     : Embed | und;
    status?     : Embed | und;
    error?      : Embed | und;
    debug?      : Embed | und;

    cmap?: Record<string, Maybe<ComponentMapItem>>;

    viewer?: Embed | und;
    editor?: Embed | und;

    navigate?: MadeSelect | undefined;
    row1?    : (MadeButton | und)[];
    sel1?    : MadeSelect | und;
    row2?    : (MadeButton | und)[];
    sel2?    : MadeSelect | und;
    row3?    : (MadeButton | und)[];
    sel3?    : MadeSelect | und;
    start?   : MadeSelect | undefined;
    back?    : MadeButton | undefined;
    submit?  : MadeButton | undefined;
    delete?  : MadeButton | undefined;
    next?    : MadeButton | undefined;
    forward? : MadeButton | undefined;
    close?   : MadeButton | undefined;
};
