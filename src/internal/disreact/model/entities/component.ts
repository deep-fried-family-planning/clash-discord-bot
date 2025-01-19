import type {E} from '#pure/effect';
import {D, g} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {ComponentUnknownError} from '#src/internal/disreact/entity/error.ts';
import type {Auth} from '#src/internal/disreact/entity/index.ts';
import {Err} from '#src/internal/disreact/entity/index.ts';
import {DA, Rf} from '#src/internal/disreact/model/entities/index.ts';
import {ComponentRoute} from '#src/internal/disreact/model/route/index.ts';
import type {mut, num} from '#src/internal/pure/types-pure.ts';
import {Discord} from 'dfx';


export type Handler = (event: unknown) => void | E.Effect<void>;


export type T = D.TaggedEnum<{
  Button       : {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.Button};
  Select       : {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.Select};
  UserSelect   : {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.UserSelect};
  RoleSelect   : {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.RoleSelect};
  ChannelSelect: {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.ChannelSelect};
  MentionSelect: {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.MentionSelect};
  Text         : {route: ComponentRoute.T; auths?: Auth.T[]; ref?: Rf.T; onClick?: Handler; data: DA.Text};
}>;

export type Button = D.TaggedEnum.Value<T, 'Button'>;
export type Select = D.TaggedEnum.Value<T, 'Select'>;
export type UserSelect = D.TaggedEnum.Value<T, 'UserSelect'>;
export type RoleSelect = D.TaggedEnum.Value<T, 'RoleSelect'>;
export type ChannelSelect = D.TaggedEnum.Value<T, 'ChannelSelect'>;
export type MentionSelect = D.TaggedEnum.Value<T, 'MentionSelect'>;
export type Text = D.TaggedEnum.Value<T, 'Text'>;

const T               = D.taggedEnum<T>();

export const Button          = T.Button;
export const Select          = T.Select;
export const UserSelect      = T.UserSelect;
export const RoleSelect      = T.RoleSelect;
export const ChannelSelect   = T.ChannelSelect;
export const MentionSelect   = T.MentionSelect;
export const Text            = T.Text;

export const isButton        = T.$is('Button');
export const isSelect        = T.$is('Select');
export const isUserSelect    = T.$is('UserSelect');
export const isRoleSelect    = T.$is('RoleSelect');
export const isChannelSelect = T.$is('ChannelSelect');
export const isMentionSelect = T.$is('MentionSelect');
export const isText          = T.$is('Text');


const decodings = {
  [Discord.ComponentType.BUTTON]            : Button,
  [Discord.ComponentType.STRING_SELECT]     : Select,
  [Discord.ComponentType.USER_SELECT]       : UserSelect,
  [Discord.ComponentType.ROLE_SELECT]       : RoleSelect,
  [Discord.ComponentType.CHANNEL_SELECT]    : ChannelSelect,
  [Discord.ComponentType.MENTIONABLE_SELECT]: MentionSelect,
  [Discord.ComponentType.TEXT_INPUT]        : Text,
};
type Decoding = keyof typeof decodings;


export const decodeMessageComponents = (ix: DA.Ix) => ix.message!.components!.map((row) => row.components.map((component) => {
  if (!component.type || !(component.type in decodings)) throw new ComponentUnknownError();

  const route = ComponentRoute.decode(component.custom_id) ?? ComponentRoute.empty();

  return decodings[component.type as Decoding]({
    route,
    ref    : Rf.decode(route.params.ref),
    onClick: emptyHandler(),
    data   : component as never,
  });
}));


export const decodeDialogComponents = (ix: DA.Ix) => ix.data.components!.map((row) => row.components.map((component) => {
  if (!component.type || !(component.type in decodings)) throw new ComponentUnknownError();

  const route = ComponentRoute.decode(component.custom_id) ?? ComponentRoute.empty();

  return decodings[component.type as Decoding]({
    route,
    ref    : Rf.decode(route.params.ref),
    onClick: emptyHandler(),
    data   : component as never,
  });
}));


export const applyDefaultRefs = (cms: T[][]) => {
  let default_ref_counter = 0;
  for (const row of cms) {
    for (const cm of row) {
      if (cm.ref === undefined || cm.ref.id === NONE) {
        (cm as mut<typeof cm>).ref = Rf.Default({id: `${default_ref_counter++}`});
      }
    }
  }
  return cms;
};


const encodings = {
  Button       : Discord.ComponentType.BUTTON,
  Select       : Discord.ComponentType.STRING_SELECT,
  UserSelect   : Discord.ComponentType.USER_SELECT,
  RoleSelect   : Discord.ComponentType.ROLE_SELECT,
  ChannelSelect: Discord.ComponentType.CHANNEL_SELECT,
  MentionSelect: Discord.ComponentType.MENTIONABLE_SELECT,
  Text         : Discord.ComponentType.TEXT_INPUT,
};

export const encodeAll = (cms: T[][]) => cms.map((row, rdx) => ({
  type      : DA.En.CT.ACTION_ROW,
  components: row.map((cm, cdx) => {
    cm.route.params.row = `${rdx}`;
    cm.route.params.col = `${cdx}`;

    return {
      ...cm.data,
      type     : encodings[cm._tag],
      custom_id: ComponentRoute.encode(cm.route),
    };
  }),
})) as DA.TxComponents;


export const getAt = (row: num, col: num) => (cms: T[][]) => g(function * () {
  const target = cms.at(row)?.at(col);
  if (!target) return yield * new Err.ComponentUnknownError();
  return target;
});


export const emptyHandler = () => () => {
};


export const getHandler = T.$match({
  Button       : (cm) => cm.onClick,
  Select       : (cm) => cm.onClick,
  UserSelect   : (cm) => cm.onClick,
  RoleSelect   : (cm) => cm.onClick,
  ChannelSelect: (cm) => cm.onClick,
  MentionSelect: (cm) => cm.onClick,
  Text         : () => emptyHandler(),
});


export const getValues = T.$match({
  Button       : () => [],
  Select       : (cm) => cm.data.options ?? [],
  UserSelect   : (cm) => cm.data.default_values ?? [],
  RoleSelect   : (cm) => cm.data.default_values ?? [],
  ChannelSelect: (cm) => cm.data.default_values ?? [],
  MentionSelect: (cm) => cm.data.default_values ?? [],
  Text         : () => [],
});
