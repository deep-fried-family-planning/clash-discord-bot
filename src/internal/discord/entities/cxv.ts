import {Cx} from '#dfdis';
import {assignFlags} from '#discord/model-routing/flags.ts';
import type {V2Route} from '#discord/model-routing/ope.ts';
import {type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, TypeC} from '#pure/dfx';
import {D, p} from '#pure/effect';
import type {ne, unk} from '#src/internal/pure/types-pure.ts';


type Ctx<T> = {
    setView     : (view: unk) => void;
    setComponent: (cx: T) => void;
    dispatch    : (action: unk) => void;
};


type Meta<T> = {
    onClick?: (cx: T, ctx: Ctx<T>) => void;
};


export type T = D.TaggedEnum<{
    Button : Meta<OptButton> & OptButton;
    Link   : Meta<OptButton> & OptButton;
    Select : Meta<OptSelect> & OptSelect;
    User   : Meta<OptUser> & OptUser;
    Role   : Meta<OptRole> & OptRole;
    Channel: Meta<OptChannel> & OptChannel;
    Mention: Meta<OptMention> & OptMention;
    Text   : Meta<OptText> & OptText;
}>;
export const C = D.taggedEnum<T>();

export const {Button, Link, Select, User, Role, Channel, Mention, Text} = C;

export const Row = (...vxs: T[]) => vxs;


const makeMap = {
    [Cx.Tag.Button] : TypeC.BUTTON,
    [Cx.Tag.Link]   : TypeC.BUTTON,
    [Cx.Tag.Select] : TypeC.STRING_SELECT,
    [Cx.Tag.User]   : TypeC.USER_SELECT,
    [Cx.Tag.Role]   : TypeC.ROLE_SELECT,
    [Cx.Tag.Channel]: TypeC.CHANNEL_SELECT,
    [Cx.Tag.Mention]: TypeC.MENTIONABLE_SELECT,
    [Cx.Tag.Text]   : TypeC.TEXT_INPUT,
};


export const make = <A extends T>(
    vx: A,
    route: V2Route,
) => {
    const {_tag, onClick, ...rest} = vx;

    const data = {
        custom_id: '',
        ...rest,
        type     : makeMap[_tag],
    };

    return p(
        Cx.C[_tag]({
            route  : route,
            status : Cx.Status.will_mount,
            flags  : assignFlags(route),
            onClick: onClick,
            data   : data,
        }),
        Cx.defaultFromView,
        (cx) => cx,
    );
};


export const captureOnClick = <A extends T>(vx: A, data: unk = {}) => {
    let view: unk      = {};
    let component: unk = {};
    let action: unk    = {};

    const ctx = {
        setView     : (called: unk) => {view = called},
        setComponent: (called: unk) => {component = called},
        dispatch    : (called: unk) => {action = called},
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vx.onClick?.(data as ne, ctx);

    return {
        view,
        component,
        action,
    };
};


export const shallow = <A extends T>(vx: A) => {
    const captured = captureOnClick(vx);

    return captured.view;
};
