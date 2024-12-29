import {Const, Cx} from '#dfdis';
import {CxPath} from '#discord/entities/cx-path.ts';
import {type ManagedOp, type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type SelectOp, TypeC} from '#pure/dfx';
import {D, p} from '#pure/effect';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


type Meta<A> = {
  accessor?: str;
  onClick? : (values: A[]) => void | AnyE<void>;
};


export type T = D.TaggedEnum<{
  Button : Meta<never> & OptButton;
  Link   : Meta<never> & OptButton;
  Select : Meta<SelectOp> & OptSelect;
  User   : Meta<ManagedOp> & OptUser;
  Role   : Meta<ManagedOp> & OptRole;
  Channel: Meta<ManagedOp> & OptChannel;
  Mention: Meta<ManagedOp> & OptMention;
  Text   : Meta<never> & OptText;
}>;
export const CxV = D.taggedEnum<T>();

export const {Button, Link, Select, User, Role, Channel, Mention, Text} = CxV;

export const Row = (...vxs: (T | boolean | und | '')[]) => vxs.filter(Boolean) as T[];


const makeMap = {
  [Cx.ButtonTag] : TypeC.BUTTON,
  [Cx.LinkTag]   : TypeC.BUTTON,
  [Cx.SelectTag] : TypeC.STRING_SELECT,
  [Cx.UserTag]   : TypeC.USER_SELECT,
  [Cx.RoleTag]   : TypeC.ROLE_SELECT,
  [Cx.ChannelTag]: TypeC.CHANNEL_SELECT,
  [Cx.MentionTag]: TypeC.MENTIONABLE_SELECT,
  [Cx.TextTag]   : TypeC.TEXT_INPUT,
};


export const make = <A extends T>(
  vx: A,
  route: CxPath,
) => {
  const {_tag, onClick = () => {}, accessor, ...rest} = vx;

  return p(
    Cx.Enum[_tag]({
      route: p(
        route,
        CxPath.set('accessor', accessor ?? Const.NONE),
      ),
      onClick: onClick as never,
      data   : {
        custom_id: '',
        ...rest,
        type     : makeMap[_tag],
      },
    }),
    Cx.makeFromView,
  );
};
