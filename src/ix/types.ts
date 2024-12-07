import type {str} from '#src/internal/pure/types-pure.ts';
import type {Embed, Message} from 'dfx/types';
import type {Button, ChannelSelect, Modal, LongText, MentionableSelect, MultiButton, NavSelect, Selectable, Pressable, RoleSelect, ShortText, StringSelect, UserSelect, Typeable} from '#src/ix/types-components.ts';
import type {Col, Kind, Mod, Row} from '#src/ix/enum/enums.ts';
import type {IXCT} from '#src/internal/discord.ts';

export type IxNamespace = str;
export type Id = str;
export type IxName = str;

export type IxId = {
    id: str;
    m : Mod;
    ns: IxNamespace;
    n : IxName;
    k : Kind;
    d : str;
};

'p/:r:c:dt';

'/:m/:ns/:n/:k/:d*';

export type Cx = {
    message: Message;
    map: {
        [k in Id]:
            | Pressable
            | Selectable
    };
    grid: [][];

    system: Embed;
    prompt: Embed;
    status: Embed;
};

export type Ax =
    | Pressable
    | Selectable
    | Typeable;


export type Tx = {
    [k in Id]:
        | Button
        | MultiButton
        | StringSelect
        | NavSelect
        | UserSelect
        | RoleSelect
        | ChannelSelect
        | MentionableSelect
};

export type Mx = {
    [k in Id]:
        | Modal
        | ShortText
        | LongText
};

export type Rx = {
    [k in Id]:
        | Pressable
        | Selectable
        | Typeable
};


