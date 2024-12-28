import {Const, Cx} from '#dfdis';
import {CxPath} from '#discord/routing/cx-path.ts';
import {type OptButton, type OptChannel, type OptMention, type OptRole, type OptSelect, type OptText, type OptUser, TypeC} from '#pure/dfx';
import {D, p} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


type Meta<A extends keyof Cx.E> = {
  accessor?: str;
  onClick? : (event: Omit<Cx.E[A], 'onClick'>) => void;
};


export type T = D.TaggedEnum<{
  Button : Meta<'Button'> & OptButton;
  Link   : Meta<'Link'> & OptButton;
  Select : Meta<'Select'> & OptSelect;
  User   : Meta<'User'> & OptUser;
  Role   : Meta<'Role'> & OptRole;
  Channel: Meta<'Channel'> & OptChannel;
  Mention: Meta<'Mention'> & OptMention;
  Text   : Meta<'Text'> & OptText;
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
  route: CxPath,
) => {
  const {_tag, onClick, accessor, ...rest} = vx;

  return p(
    Cx.C[_tag]({
      route: p(
        route,
        CxPath.set('accessor', accessor ?? Const.NONE),
      ),
      onClick: onClick ?? (() => {}),
      data   : {
        custom_id: '',
        ...rest,
        type     : makeMap[_tag],
      },
    }),
    Cx.defaultFromView,
  );
};
