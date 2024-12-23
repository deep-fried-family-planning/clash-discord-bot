import {Ar, D, p} from '#src/internal/pure/effect.ts';
import type {RestButton, RestSelect, RestText, RestMessage, RestEmbed} from '#src/internal/ix-v2/model/types.ts';
import type {ActionRow, Component} from 'dfx/types';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';
import {Cx} from '#src/internal/ix-v2/model/entities/cx.ts';


type _T = D.TaggedEnum<{
    row    : ActionRow & {custom_id: str; children: _T[]};
    button : RestButton;
    link   : RestButton;
    premium: RestButton;
    select : RestSelect;
    user   : RestSelect;
    role   : RestSelect;
    channel: RestSelect;
    mention: RestSelect;
    text   : RestText;
}>;
const _C = D.taggedEnum<_T>();


export const {
    row: Row,
    link: Link,
    button: Button,
    select: Select,
    user: User,
    role: Role,
    channel: Channel,
    mention: Mention,
    text: Text,
} = _C;


export const pure = <A extends _T>(self: A) => self;

export const map = <A extends _T, B>(fa: (a: A) => B) => (a: A) => fa(a);

const TMap = {
    [Discord.ComponentType.ACTION_ROW as num]: _C.row,
    [Discord.ComponentType.BUTTON as num]    : (rx: RestButton) => {
        if (!rx.custom_id) {
            return _C.link({...rx, custom_id: ''});
        }
    },
    [Discord.ComponentType.TEXT_INPUT as num]        : _C.text,
    [Discord.ComponentType.STRING_SELECT as num]     : _C.select,
    [Discord.ComponentType.USER_SELECT as num]       : _C.user,
    [Discord.ComponentType.ROLE_SELECT as num]       : _C.role,
    [Discord.ComponentType.CHANNEL_SELECT as num]    : _C.channel,
    [Discord.ComponentType.MENTIONABLE_SELECT as num]: _C.mention,
};

export const make = (rest: Component) => p(
    TMap[rest.type](rest as never),
    _C.$match({
        row    : (r) => _C.row({...r, children: p(r.components, Ar.map((r) => make(r)))}),
        button : pure,
        link   : pure,
        premium: pure,
        text   : pure,
        select : pure,
        user   : pure,
        role   : pure,
        channel: pure,
        mention: pure,
    }),
);
