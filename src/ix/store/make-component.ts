import {Discord, UI} from 'dfx';
import type {Button, SelectMenu, TextInput} from 'dfx/types';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {CxId} from '#src/ix/store/types-components.ts';


export type RxCxLookup =
    | [Discord.ComponentType.BUTTON, Button]
    | [Discord.ComponentType.STRING_SELECT, SelectMenu]
    | [Discord.ComponentType.CHANNEL_SELECT, SelectMenu]
    | [Discord.ComponentType.ROLE_SELECT, SelectMenu]
    | [Discord.ComponentType.MENTIONABLE_SELECT, SelectMenu]
    | [Discord.ComponentType.USER_SELECT, SelectMenu]
    | [Discord.ComponentType.TEXT_INPUT, TextInput];


export type ResolveRxCx<C> =
    C extends {type: infer T}
        ? Extract<RxCxLookup, [T, ...unknown[]]>[1]
        : C;


type Ope<T, R > = {
    id      : CxId;
    mode?   : str;
    restType: T;
    rest    : R;
};

type Cx<T, R> = {
    type: T;
    rest: R;
};
export type CxButton = Cx<Discord.ComponentType.BUTTON, Button>;
export type CxText = Cx<Discord.ComponentType.TEXT_INPUT, TextInput>;
export type CxString = Cx<Discord.ComponentType.STRING_SELECT, SelectMenu>;
export type CxChannel = Cx<Discord.ComponentType.CHANNEL_SELECT, SelectMenu>;
export type CxRole = Cx<Discord.ComponentType.ROLE_SELECT, SelectMenu>;
export type CxMention = Cx<Discord.ComponentType.MENTIONABLE_SELECT, SelectMenu>;
export type CxUser = Cx<Discord.ComponentType.USER_SELECT, SelectMenu>;


export type Component =
    | CxButton
    | CxText
    | CxString
    | CxChannel
    | CxRole
    | CxMention
    | CxUser;


export type TxCx = ReturnType<ReturnType<typeof createComponent>['make']>;

export const createComponent = <
    C extends Component,
    K extends str,
>(
    config: {
        name  : str;
        type  : C['type'];
        base  : Partial<C['rest']>;
        init? : K;
        modes?: {
            [k in K]: () => {
                next: K | 'none';
                rest: Partial<C['rest']>;
            };
        };
    },
) => ({
    config,
    make: (
        rest: {onClick: str} & Partial<C['rest']>,
    ) => ({
        config,
        rest,
    }),
});


const baseRenders = {
    [`${Discord.ComponentType.BUTTON}`]            : UI.button,
    [`${Discord.ComponentType.STRING_SELECT}`]     : UI.select,
    [`${Discord.ComponentType.CHANNEL_SELECT}`]    : UI.channelSelect,
    [`${Discord.ComponentType.ROLE_SELECT}`]       : UI.roleSelect,
    [`${Discord.ComponentType.MENTIONABLE_SELECT}`]: UI.mentionableSelect,
    [`${Discord.ComponentType.USER_SELECT}`]       : UI.userSelect,
    [`${Discord.ComponentType.TEXT_INPUT}`]        : UI.textInput,
} as const;

