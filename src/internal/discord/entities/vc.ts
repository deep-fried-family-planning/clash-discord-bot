import {NONE} from '#discord/entities/constants/path.ts';
import {Cx} from '#discord/entities/index.ts';
import {CxPath} from '#discord/entities/routing/cx-path.ts';
import {type ManagedOp, type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, type SelectOp, TypeC} from '#pure/dfx';
import {D, p} from '#pure/effect';
import type {str, und} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


type Meta<A> = {
  accessor?: str;
  onClick? : (values: A[]) => void | AnyE<void>;
};


export type Type = D.TaggedEnum<{
  Button : Meta<never> & OptButton;
  Link   : Meta<never> & OptButton;
  Select : Meta<SelectOp> & OptSelect;
  User   : Meta<ManagedOp> & OptUser;
  Role   : Meta<ManagedOp> & OptRole;
  Channel: Meta<ManagedOp> & OptChannel;
  Mention: Meta<ManagedOp> & OptMention;
  Text   : Meta<never> & OptText;
}>;
export const Enum = D.taggedEnum<Type>();


export const ButtonTag  = 'Button';
export const LinkTag    = 'Link';
export const SelectTag  = 'Select';
export const UserTag    = 'User';
export const RoleTag    = 'Role';
export const ChannelTag = 'Channel';
export const MentionTag = 'Mention';
export const TextTag    = 'Text';


export const Row     = (...vxs: (Type | boolean | und | '')[]) => vxs.filter(Boolean) as Type[];
export const Button  = Enum.Button;
export const Link    = Enum.Link;
export const Select  = Enum.Select;
export const User    = Enum.User;
export const Role    = Enum.Role;
export const Channel = Enum.Channel;
export const Mention = Enum.Mention;
export const Text    = Enum.Text;


export const match     = Enum.$match;
export const is        = Enum.$is;
export const isButton  = is('Button');
export const isLink    = is('Link');
export const isSelect  = is('Select');
export const isUser    = is('User');
export const isRole    = is('Role');
export const isChannel = is('Channel');
export const isMention = is('Mention');
export const isText    = is('Text');


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


export const make = <A extends Type>(
  vx: A,
  route: Cx.Path,
) => {
  const {_tag, onClick = () => {}, accessor, ...rest} = vx;

  return p(
    Cx.Enum[_tag]({
      route: p(
        route,
        CxPath.set('accessor', accessor ?? NONE),
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
