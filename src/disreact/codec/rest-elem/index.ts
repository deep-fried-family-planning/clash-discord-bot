import {Actions} from '#src/disreact/codec/rest-elem/container/actions.ts';
import {Button} from '#src/disreact/codec/rest-elem/component/button.ts';
import {Channels} from '#src/disreact/codec/rest-elem/component/channels.ts';
import {Danger} from '#src/disreact/codec/rest-elem/component/danger.ts';
import {Default} from '#src/disreact/codec/rest-elem/component/default.ts';
import {Link} from '#src/disreact/codec/rest-elem/component/link.ts';
import {Mentions} from '#src/disreact/codec/rest-elem/component/mentions.ts';
import {Option} from '#src/disreact/codec/rest-elem/component/option.ts';
import {Premium} from '#src/disreact/codec/rest-elem/component/premium.ts';
import {Primary} from '#src/disreact/codec/rest-elem/component/primary.ts';
import {Roles} from '#src/disreact/codec/rest-elem/component/roles.ts';
import {Secondary} from '#src/disreact/codec/rest-elem/component/secondary.ts';
import {Select} from '#src/disreact/codec/rest-elem/component/select.ts';
import {Success} from '#src/disreact/codec/rest-elem/component/success.ts';
import {TextInput} from '#src/disreact/codec/rest-elem/component/textinput.ts';
import {Users} from '#src/disreact/codec/rest-elem/component/users.ts';
import {Author} from '#src/disreact/codec/rest-elem/embed/author.ts';
import {Embed} from '#src/disreact/codec/rest-elem/embed/embed.ts';
import {Field} from '#src/disreact/codec/rest-elem/embed/field.ts';
import {Footer} from '#src/disreact/codec/rest-elem/embed/footer.ts';
import {Img} from '#src/disreact/codec/rest-elem/embed/img.ts';
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts';
import {Anchor} from '#src/disreact/codec/rest-elem/markdown/a.ts';
import {AtMention} from '#src/disreact/codec/rest-elem/markdown/at.ts';
import {Bold} from '#src/disreact/codec/rest-elem/markdown/b.ts';
import {BlockQuote} from '#src/disreact/codec/rest-elem/markdown/blockquote.ts';
import {Break} from '#src/disreact/codec/rest-elem/markdown/br.ts';
import {Code} from '#src/disreact/codec/rest-elem/markdown/code.ts';
import {H1} from '#src/disreact/codec/rest-elem/markdown/h1.ts';
import {H2} from '#src/disreact/codec/rest-elem/markdown/h2.ts';
import {H3} from '#src/disreact/codec/rest-elem/markdown/h3.ts';
import {Italic} from '#src/disreact/codec/rest-elem/markdown/i.ts';
import {ListItem} from '#src/disreact/codec/rest-elem/markdown/li.ts';
import {MaskAnchor} from '#src/disreact/codec/rest-elem/markdown/mask.ts';
import {OrderedList} from '#src/disreact/codec/rest-elem/markdown/ol.ts';
import {Paragraph} from '#src/disreact/codec/rest-elem/markdown/p.ts';
import {Pre} from '#src/disreact/codec/rest-elem/markdown/pre.ts';
import {Strikethrough} from '#src/disreact/codec/rest-elem/markdown/s.ts';
import {Small} from '#src/disreact/codec/rest-elem/markdown/small.ts';
import {Time} from '#src/disreact/codec/rest-elem/markdown/time.ts';
import {Underline} from '#src/disreact/codec/rest-elem/markdown/u.ts';
import {UnorderedList} from '#src/disreact/codec/rest-elem/markdown/ul.ts';
import {Message} from '#src/disreact/codec/rest-elem/container/message.ts';
import {Modal} from '#src/disreact/codec/rest-elem/container/modal.ts';
import {Ephemeral} from '#src/disreact/codec/rest-elem/container/ephemeral.ts';
import { Keys } from '#src/disreact/codec/rest-elem/keys.ts';
import {pipe, S} from '#src/disreact/utils/re-exports.ts';
import { DAPI } from '../dapi/dapi';

export * as Intrinsic from '#src/disreact/codec/rest-elem/index.ts';
export type Intrinsic = never;

export const isModal = (intrinsic: any) => 'custom_id' in intrinsic;

export const isEphemeral = (intrinsic: any) => 'flags' in intrinsic && intrinsic.flags === 64;

export const IntrinsicMap = {
  [Emoji.TAG]        : Emoji.Children,
  [Message.TAG]      : Message.Children,
  [Embed.TAG]        : Embed.Children,
  [Author.TAG]       : Author.Children,
  [Footer.TAG]       : Footer.Children,
  [Field.TAG]        : Field.Children,
  [Img.TAG]          : Img.Children,
  [Actions.TAG]      : Actions.Children,
  [Button.TAG]       : Button.Children,
  [Primary.TAG]      : Primary.Children,
  [Secondary.TAG]    : Secondary.Children,
  [Success.TAG]      : Success.Children,
  [Danger.TAG]       : Danger.Children,
  [Link.TAG]         : Link.Children,
  [Premium.TAG]      : Premium.Children,
  [Select.TAG]       : Select.Children,
  [Channels.TAG]     : Channels.Children,
  [Users.TAG]        : Users.Children,
  [Roles.TAG]        : Roles.Children,
  [Mentions.TAG]     : Mentions.Children,
  [Option.TAG]       : Option.Children,
  [Default.TAG]      : Default.Children,
  [Modal.TAG]        : Modal.Children,
  [TextInput.TAG]    : TextInput.Children,
  [Anchor.TAG]       : Anchor.Children,
  [AtMention.TAG]    : AtMention.Children,
  [Break.TAG]        : Break.Children,
  [Bold.TAG]         : Bold.Children,
  [BlockQuote.TAG]   : BlockQuote.Children,
  [Code.TAG]         : Code.Children,
  [Pre.TAG]          : Pre.Children,
  [H1.TAG]           : H1.Children,
  [H2.TAG]           : H2.Children,
  [H3.TAG]           : H3.Children,
  [Italic.TAG]       : Italic.Children,
  [ListItem.TAG]     : ListItem.Children,
  [MaskAnchor.TAG]   : MaskAnchor.Children,
  [OrderedList.TAG]  : OrderedList.Children,
  [Paragraph.TAG]    : Paragraph.Children,
  [Strikethrough.TAG]: Strikethrough.Children,
  [Small.TAG]        : Small.Children,
  [Time.TAG]         : Time.Children,
  [Underline.TAG]    : Underline.Children,
  [UnorderedList.TAG]: UnorderedList.Children,
};

export const Children = {

  [Emoji.TAG]        : Emoji.Children,
  [Message.TAG]      : Message.Children,
  [Embed.TAG]        : Embed.Children,
  [Author.TAG]       : Author.Children,
  [Footer.TAG]       : Footer.Children,
  [Field.TAG]        : Field.Children,
  [Img.TAG]          : Img.Children,
  [Actions.TAG]      : Actions.Children,
  [Button.TAG]       : Button.Children,
  [Primary.TAG]      : Primary.Children,
  [Secondary.TAG]    : Secondary.Children,
  [Success.TAG]      : Success.Children,
  [Danger.TAG]       : Danger.Children,
  [Link.TAG]         : Link.Children,
  [Premium.TAG]      : Premium.Children,
  [Select.TAG]       : Select.Children,
  [Channels.TAG]     : Channels.Children,
  [Users.TAG]        : Users.Children,
  [Roles.TAG]        : Roles.Children,
  [Mentions.TAG]     : Mentions.Children,
  [Option.TAG]       : Option.Children,
  [Default.TAG]      : Default.Children,
  [Modal.TAG]        : Modal.Children,
  [TextInput.TAG]    : TextInput.Children,
  [Anchor.TAG]       : Anchor.Children,
  [AtMention.TAG]    : AtMention.Children,
  [Break.TAG]        : Break.Children,
  [Bold.TAG]         : Bold.Children,
  [BlockQuote.TAG]   : BlockQuote.Children,
  [Code.TAG]         : Code.Children,
  [Pre.TAG]          : Pre.Children,
  [H1.TAG]           : H1.Children,
  [H2.TAG]           : H2.Children,
  [H3.TAG]           : H3.Children,
  [Italic.TAG]       : Italic.Children,
  [ListItem.TAG]     : ListItem.Children,
  [MaskAnchor.TAG]   : MaskAnchor.Children,
  [OrderedList.TAG]  : OrderedList.Children,
  [Paragraph.TAG]    : Paragraph.Children,
  [Strikethrough.TAG]: Strikethrough.Children,
  [Small.TAG]        : Small.Children,
  [Time.TAG]         : Time.Children,
  [Underline.TAG]    : Underline.Children,
  [UnorderedList.TAG]: UnorderedList.Children,
};

export const EventData = {
  [Button.TAG]   : Button.EventData,
  [Primary.TAG]  : Primary.EventData,
  [Secondary.TAG]: Secondary.EventData,
  [Success.TAG]  : Success.EventData,
  [Danger.TAG]   : Danger.EventData,
  [Select.TAG]   : Select.EventData,
  [Channels.TAG] : Channels.EventData,
  [Users.TAG]    : Users.EventData,
  [Roles.TAG]    : Roles.EventData,
  [Mentions.TAG] : Mentions.EventData,
  [Modal.TAG]    : Modal.EventData,
};

export const Handler = {
  [Button.TAG]   : Button.Handler,
  [Primary.TAG]  : Primary.Handler,
  [Secondary.TAG]: Secondary.Handler,
  [Success.TAG]  : Success.Handler,
  [Danger.TAG]   : Danger.Handler,
  [Select.TAG]   : Select.Handler,
  [Channels.TAG] : Channels.Handler,
  [Users.TAG]    : Users.Handler,
  [Roles.TAG]    : Roles.Handler,
  [Mentions.TAG] : Mentions.Handler,
  [Modal.TAG]    : Modal.Handler,
};

export const Attributes = {
  [Emoji.TAG]        : Emoji.Attributes,
  [Message.TAG]      : Message.Attributes,
  [Embed.TAG]        : Embed.Attributes,
  [Author.TAG]       : Author.Attributes,
  [Footer.TAG]       : Footer.Attributes,
  [Field.TAG]        : Field.Attributes,
  [Img.TAG]          : Img.Attributes,
  [Actions.TAG]      : Actions.Attributes,
  [Button.TAG]       : Button.Attributes,
  [Primary.TAG]      : Primary.Attributes,
  [Secondary.TAG]    : Secondary.Attributes,
  [Success.TAG]      : Success.Attributes,
  [Danger.TAG]       : Danger.Attributes,
  [Link.TAG]         : Link.Attributes,
  [Premium.TAG]      : Premium.Attributes,
  [Select.TAG]       : Select.Attributes,
  [Channels.TAG]     : Channels.Attributes,
  [Users.TAG]        : Users.Attributes,
  [Roles.TAG]        : Roles.Attributes,
  [Mentions.TAG]     : Mentions.Attributes,
  [Option.TAG]       : Option.Attributes,
  [Default.TAG]      : Default.Attributes,
  [Modal.TAG]        : Modal.Attributes,
  [TextInput.TAG]    : TextInput.Attributes,
  [Anchor.TAG]       : Anchor.Attributes,
  [AtMention.TAG]    : AtMention.Attributes,
  [Break.TAG]        : Break.Attributes,
  [Bold.TAG]         : Bold.Attributes,
  [BlockQuote.TAG]   : BlockQuote.Attributes,
  [Code.TAG]         : Code.Attributes,
  [Pre.TAG]          : Pre.Attributes,
  [H1.TAG]           : H1.Attributes,
  [H2.TAG]           : H2.Attributes,
  [H3.TAG]           : H3.Attributes,
  [Italic.TAG]       : Italic.Attributes,
  [ListItem.TAG]     : ListItem.Attributes,
  [MaskAnchor.TAG]   : MaskAnchor.Attributes,
  [OrderedList.TAG]  : OrderedList.Attributes,
  [Paragraph.TAG]    : Paragraph.Attributes,
  [Strikethrough.TAG]: Strikethrough.Attributes,
  [Small.TAG]        : Small.Attributes,
  [Time.TAG]         : Time.Attributes,
  [Underline.TAG]    : Underline.Attributes,
  [UnorderedList.TAG]: UnorderedList.Attributes,
  [Ephemeral.TAG]    : Ephemeral.Attributes,
};

export const NORM = {
  [Emoji.TAG]        : Emoji.NORM,
  [Message.TAG]      : Message.NORM,
  [Embed.TAG]        : Embed.NORM,
  [Author.TAG]       : Author.NORM,
  [Footer.TAG]       : Footer.NORM,
  [Field.TAG]        : Field.NORM,
  [Img.TAG]          : Img.NORM,
  [Actions.TAG]      : Actions.NORM,
  [Button.TAG]       : Button.NORM,
  [Primary.TAG]      : Primary.NORM,
  [Secondary.TAG]    : Secondary.NORM,
  [Success.TAG]      : Success.NORM,
  [Danger.TAG]       : Danger.NORM,
  [Link.TAG]         : Link.NORM,
  [Premium.TAG]      : Premium.NORM,
  [Select.TAG]       : Select.NORM,
  [Channels.TAG]     : Channels.NORM,
  [Users.TAG]        : Users.NORM,
  [Roles.TAG]        : Roles.NORM,
  [Mentions.TAG]     : Mentions.NORM,
  [Option.TAG]       : Option.NORM,
  [Default.TAG]      : Default.NORM,
  [Modal.TAG]        : Modal.NORM,
  [TextInput.TAG]    : TextInput.NORM,
  [Anchor.TAG]       : Anchor.NORM,
  [AtMention.TAG]    : AtMention.NORM,
  [Break.TAG]        : Break.NORM,
  [Bold.TAG]         : Bold.NORM,
  [BlockQuote.TAG]   : BlockQuote.NORM,
  [Code.TAG]         : Code.NORM,
  [Pre.TAG]          : Pre.NORM,
  [H1.TAG]           : H1.NORM,
  [H2.TAG]           : H2.NORM,
  [H3.TAG]           : H3.NORM,
  [Italic.TAG]       : Italic.NORM,
  [ListItem.TAG]     : ListItem.NORM,
  [MaskAnchor.TAG]   : MaskAnchor.NORM,
  [OrderedList.TAG]  : OrderedList.NORM,
  [Paragraph.TAG]    : Paragraph.NORM,
  [Strikethrough.TAG]: Strikethrough.NORM,
  [Small.TAG]        : Small.NORM,
  [Time.TAG]         : Time.NORM,
  [Underline.TAG]    : Underline.NORM,
  [UnorderedList.TAG]: UnorderedList.NORM,
  [Ephemeral.TAG]    : Ephemeral.NORM,
} as any;

export const ENC =  {
  [Emoji.TAG]        : Emoji.encode,
  [Message.TAG]      : Message.encode,
  [Ephemeral.TAG]    : Ephemeral.encode,
  [Embed.TAG]        : Embed.encode,
  [Author.TAG]       : Author.encode,
  [Footer.TAG]       : Footer.encode,
  [Field.TAG]        : Field.encode,
  [Img.TAG]          : Img.encode,
  [Actions.TAG]      : Actions.encode,
  [Button.TAG]       : Button.encode,
  [Primary.TAG]      : Primary.encode,
  [Secondary.TAG]    : Secondary.encode,
  [Success.TAG]      : Success.encode,
  [Danger.TAG]       : Danger.encode,
  [Link.TAG]         : Link.encode,
  [Premium.TAG]      : Premium.encode,
  [Select.TAG]       : Select.encode,
  [Channels.TAG]     : Channels.encode,
  [Users.TAG]        : Users.encode,
  [Roles.TAG]        : Roles.encode,
  [Mentions.TAG]     : Mentions.encode,
  [Option.TAG]       : Option.encode,
  [Default.TAG]      : Default.encode,
  [Modal.TAG]        : Modal.encode,
  [TextInput.TAG]    : TextInput.encode,
  [Anchor.TAG]       : Anchor.encode,
  [AtMention.TAG]    : AtMention.encode,
  [Break.TAG]        : Break.encode,
  [Bold.TAG]         : Bold.encode,
  [BlockQuote.TAG]   : BlockQuote.encode,
  [Code.TAG]         : Code.encode,
  [Pre.TAG]          : Pre.encode,
  [H1.TAG]           : H1.encode,
  [H2.TAG]           : H2.encode,
  [H3.TAG]           : H3.encode,
  [Italic.TAG]       : Italic.encode,
  [ListItem.TAG]     : ListItem.encode,
  [MaskAnchor.TAG]   : MaskAnchor.encode,
  [OrderedList.TAG]  : OrderedList.encode,
  [Paragraph.TAG]    : Paragraph.encode,
  [Strikethrough.TAG]: Strikethrough.encode,
  [Small.TAG]        : Small.encode,
  [Time.TAG]         : Time.encode,
  [Underline.TAG]    : Underline.encode,
  [UnorderedList.TAG]: UnorderedList.encode,
} as any;

export const Element = {
  [Emoji.TAG]        : Emoji.Element,
  [Message.TAG]      : Message.Element,
  [Embed.TAG]        : Embed.Element,
  [Author.TAG]       : Author.Element,
  [Footer.TAG]       : Footer.Element,
  [Field.TAG]        : Field.Element,
  [Img.TAG]          : Img.Element,
  [Actions.TAG]      : Actions.Element,
  [Button.TAG]       : Button.Element,
  [Primary.TAG]      : Primary.Element,
  [Secondary.TAG]    : Secondary.Element,
  [Success.TAG]      : Success.Element,
  [Danger.TAG]       : Danger.Element,
  [Link.TAG]         : Link.Element,
  [Premium.TAG]      : Premium.Element,
  [Select.TAG]       : Select.Element,
  [Channels.TAG]     : Channels.Element,
  [Users.TAG]        : Users.Element,
  [Roles.TAG]        : Roles.Element,
  [Mentions.TAG]     : Mentions.Element,
  [Option.TAG]       : Option.Element,
  [Default.TAG]      : Default.Element,
  [Modal.TAG]        : Modal.Element,
  [TextInput.TAG]    : TextInput.Element,
  [Anchor.TAG]       : Anchor.Element,
  [AtMention.TAG]    : AtMention.Element,
  [Break.TAG]        : Break.Element,
  [Bold.TAG]         : Bold.Element,
  [BlockQuote.TAG]   : BlockQuote.Element,
  [Code.TAG]         : Code.Element,
  [Pre.TAG]          : Pre.Element,
  [H1.TAG]           : H1.Element,
  [H2.TAG]           : H2.Element,
  [H3.TAG]           : H3.Element,
  [Italic.TAG]       : Italic.Element,
  [ListItem.TAG]     : ListItem.Element,
  [MaskAnchor.TAG]   : MaskAnchor.Element,
  [OrderedList.TAG]  : OrderedList.Element,
  [Paragraph.TAG]    : Paragraph.Element,
  [Strikethrough.TAG]: Strikethrough.Element,
  [Small.TAG]        : Small.Element,
  [Time.TAG]         : Time.Element,
  [Underline.TAG]    : Underline.Element,
  [UnorderedList.TAG]: UnorderedList.Element,
};

export type IntrinsicTuples =
  | [typeof Emoji.TAG, typeof Emoji.Attributes.Type]
  | [typeof Message.TAG, typeof Message.Attributes.Type]
  | [typeof Embed.TAG, typeof Embed.Attributes.Type]
  | [typeof Author.TAG, typeof Author.Attributes.Type]
  | [typeof Footer.TAG, typeof Footer.Attributes.Type]
  | [typeof Field.TAG, typeof Field.Attributes.Type]
  | [typeof Img.TAG, typeof Img.Attributes.Type]
  | [typeof Actions.TAG, typeof Actions.Attributes.Type]
  | [typeof Button.TAG, typeof Button.Attributes.Type]
  | [typeof Primary.TAG, typeof Primary.Attributes.Type]
  | [typeof Secondary.TAG, typeof Secondary.Attributes.Type]
  | [typeof Success.TAG, typeof Success.Attributes.Type]
  | [typeof Danger.TAG, typeof Danger.Attributes.Type]
  | [typeof Link.TAG, typeof Link.Attributes.Type]
  | [typeof Premium.TAG, typeof Premium.Attributes.Type]
  | [typeof Select.TAG, typeof Select.Attributes.Type]
  | [typeof Channels.TAG, typeof Channels.Attributes.Type]
  | [typeof Users.TAG, typeof Users.Attributes.Type]
  | [typeof Roles.TAG, typeof Roles.Attributes.Type]
  | [typeof Mentions.TAG, typeof Mentions.Attributes.Type]
  | [typeof Option.TAG, typeof Option.Attributes.Type]
  | [typeof Default.TAG, typeof Default.Attributes.Type]
  | [typeof Modal.TAG, typeof Modal.Attributes.Type]
  | [typeof TextInput.TAG, typeof TextInput.Attributes.Type]
  | [typeof Anchor.TAG, typeof Anchor.Attributes.Type]
  | [typeof AtMention.TAG, typeof AtMention.Attributes.Type]
  | [typeof Break.TAG, typeof Break.Attributes.Type]
  | [typeof Bold.TAG, typeof Bold.Attributes.Type]
  | [typeof BlockQuote.TAG, typeof BlockQuote.Attributes.Type]
  | [typeof Code.TAG, typeof Code.Attributes.Type]
  | [typeof Pre.TAG, typeof Pre.Attributes.Type]
  | [typeof H1.TAG, typeof H1.Attributes.Type]
  | [typeof H2.TAG, typeof H2.Attributes.Type]
  | [typeof H3.TAG, typeof H3.Attributes.Type]
  | [typeof Italic.TAG, typeof Italic.Attributes.Type]
  | [typeof ListItem.TAG, typeof ListItem.Attributes.Type]
  | [typeof MaskAnchor.TAG, typeof MaskAnchor.Attributes.Type]
  | [typeof OrderedList.TAG, typeof OrderedList.Attributes.Type]
  | [typeof Paragraph.TAG, typeof Paragraph.Attributes.Type]
  | [typeof Strikethrough.TAG, typeof Strikethrough.Attributes.Type]
  | [typeof Small.TAG, typeof Small.Attributes.Type]
  | [typeof Time.TAG, typeof Time.Attributes.Type]
  | [typeof Underline.TAG, typeof Underline.Attributes.Type]
  | [typeof UnorderedList.TAG, typeof UnorderedList.Attributes.Type]
  | [typeof Ephemeral.TAG, typeof Ephemeral.Attributes.Type];

export type IntrinsicTuplesMapped = {
  [K in IntrinsicTuples as K[0]]: K[1];
};
