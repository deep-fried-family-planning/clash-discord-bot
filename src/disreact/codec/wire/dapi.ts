import {CallbackType} from '#src/disreact/codec/enum/index.ts';
import {Any, Array, Boolean, Int, Literal, optional, optionalWith, String, Struct, Union} from 'effect/Schema';



export const CustomId = String;

export const SnowFlake = String;

export const Emoji = Struct({
  id      : optional(String),
  name    : optional(String),
  animated: optional(Boolean),
});

export const EmbedAuthor = Struct({
  name: String,
  url : optional(String),
});

export const EmbedField = Struct({
  name  : String,
  value : String,
  inline: optional(Boolean),
});

export const EmbedFooter = Struct({
  text: String,
});

export const EmbedImage = Struct({
  url: optional(String),
});

export const Embed = Struct({
  author     : optional(EmbedAuthor),
  title      : optional(String),
  description: optional(String),
  image      : optional(EmbedImage),
  fields     : optional(Array(EmbedField)),
  footer     : optional(EmbedFooter),
});



export const Button = Struct({
  type     : Literal(2),
  custom_id: optional(String),
  label    : optional(String),
  style    : Literal(1, 2, 3, 4, 5, 6),
  disabled : optional(Boolean),
  sku_id   : optional(String),
  url      : optional(String),
  emoji    : optional(Emoji),
});

export const ButtonRow = Struct({
  type      : Literal(1),
  components: Array(Button),
});

export const SelectOption = Struct({
  label      : String,
  value      : String,
  description: optional(String),
  emoji      : optional(Emoji),
  default    : optional(Boolean),
});

export const StringSelect = Struct({
  type       : Literal(3),
  custom_id  : String,
  placeholder: optional(String),
  min_values : optional(Int),
  max_values : optional(Int),
  options    : Array(SelectOption),
});

export const SelectUserValue = Struct({
  type: Literal('user'),
  id  : String,
});

export const UserSelect = Struct({
  type          : Literal(5),
  custom_id     : String,
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  default_values: optional(Array(SelectUserValue)),
});

export const SelectRoleValue = Struct({
  type: Literal('role'),
  id  : String,
});

export const RoleSelect = Struct({
  type          : Literal(6),
  custom_id     : String,
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  default_values: optional(Array(SelectRoleValue)),
});

export const SelectChannelValue = Struct({
  type: Literal('channel'),
  id  : String,
});

export const ChannelSelect = Struct({
  type          : Literal(8),
  custom_id     : String,
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  channel_types : optional(Array(Int)),
  default_values: optional(Array(SelectChannelValue)),
});

export const SelectValue = Union(
  SelectUserValue,
  SelectRoleValue,
  SelectChannelValue,
);

export const MentionSelect = Struct({
  type          : Literal(7),
  custom_id     : String,
  placeholder   : optional(String),
  min_values    : optional(Int),
  max_values    : optional(Int),
  channel_types : optional(Array(Int)),
  default_values: optional(Array(SelectValue)),
});

export const SelectComponent = Union(
  StringSelect,
  UserSelect,
  RoleSelect,
  ChannelSelect,
  MentionSelect,
);

export const SelectRow = Struct({
  type      : Literal(1),
  components: Array(SelectComponent),
});

export const MessageRow = Union(
  ButtonRow,
  SelectRow,
);

export const Message = Struct({
  content   : optional(String),
  embeds    : optional(Array(Embed)),
  components: optional(Array(MessageRow)),
  flags     : optional(Int),
});

export const InteractionRequestBase = Struct({
  id   : String,
  token: String,
});

export const ButtonData = Struct({
  custom_id     : String,
  component_type: Literal(2),
});

export const StringSelectData = Struct({
  custom_id     : String,
  component_type: Literal(3),
  values        : Array(String),
});

export const UserSelectData = Struct({
  custom_id     : String,
  component_type: Literal(5),
  values        : Array(String),
  resolved      : Struct({
    users: Array(Any),
  }),
});

export const RoleSelectData = Struct({
  custom_id     : String,
  component_type: Literal(6),
  values        : Array(String),
  resolved      : Struct({
    roles: Array(Any),
  }),
});

export const ChannelSelectData = Struct({
  custom_id     : String,
  component_type: Literal(8),
  values        : Array(String),
  resolved      : Struct({
    channels: Array(Any),
  }),
});

export const MentionSelectData = Struct({
  custom_id     : String,
  component_type: Literal(7),
  values        : Array(String),
  resolved      : Struct({
    users   : Array(Any).pipe(optionalWith({default: () => []})),
    roles   : Array(Any).pipe(optionalWith({default: () => []})),
    channels: Array(Any).pipe(optionalWith({default: () => []})),
  }),
});

export const ComponentData = Union(
  ButtonData,
  StringSelectData,
  UserSelectData,
  RoleSelectData,
  ChannelSelectData,
  MentionSelectData,
);

export const ComponentRequest = Struct({
  type   : Literal(3),
  data   : ComponentData,
  message: Message,
  ...InteractionRequestBase.fields,
});

export const TextInputData = Struct({
  custom_id: String,
  value    : String,
});

export const ModalRowData = Struct({
  type      : Literal(1),
  components: Array(TextInputData),
});

export const ModalData = Struct({
  custom_id : String,
  components: Array(ModalRowData),
});

export const ModalRequest = Struct({
  type   : Literal(5),
  data   : ModalData,
  message: optional(Message),
  ...InteractionRequestBase.fields,
});

export const Interaction = Union(
  ComponentRequest,
  ModalRequest,
);

export const TextInput = Struct({
  type : Literal(1),
  style: Literal(1, 2),
  label: String,
  value: String,
});

export const ModalRow = Struct({
  type      : Literal(1),
  components: Array(TextInput),
});

export const Modal = Struct({
  custom_id : String,
  title     : String,
  components: Array(ModalRow),
});

export const CallbackModal = Struct({
  type: CallbackType.Modal,
  data: Modal,
});

export const CallbackSpent = Struct({
  type: CallbackType.Spent,
  data: Message,
});

export const CallbackDefer = Struct({
  type: CallbackType.Defer,
});

export const CreateResponse = Union(
  CallbackModal,
  CallbackSpent,
  CallbackDefer,
);

export const EditResponse = Struct({
  id    : String,
  app_id: String,
  token : String,
  data  : Message,
});

export type SnowFlake = typeof SnowFlake.Type;
export type Input = typeof Interaction.Type;
