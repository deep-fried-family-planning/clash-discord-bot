import type {str} from '#src/internal/pure/types-pure.ts';
import type {Kind, Mod} from '#src/ix/enum/enums.ts';
import type {Button, ChannelSelect, LongText, MentionableSelect, Modal, MultiButton, NavSelect, Pressable, RoleSelect, Selectable, ShortText, StringSelect, Typeable, UserSelect} from '#src/ix/types-components.ts';
import type {Embed, Message} from 'dfx/types';


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
