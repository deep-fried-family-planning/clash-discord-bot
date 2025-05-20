import * as Actions from '#src/disreact/codec/intrinsic/button/actions.ts';
import * as Button from '#src/disreact/codec/intrinsic/button/button.ts';
import * as Danger from '#src/disreact/codec/intrinsic/button/danger.ts';
import * as Link from '#src/disreact/codec/intrinsic/button/link.ts';
import * as Premium from '#src/disreact/codec/intrinsic/button/premium.ts';
import * as Primary from '#src/disreact/codec/intrinsic/button/primary.ts';
import * as Secondary from '#src/disreact/codec/intrinsic/button/secondary.ts';
import * as Success from '#src/disreact/codec/intrinsic/button/success.ts';
import * as Ephemeral from '#src/disreact/codec/intrinsic/container/ephemeral.ts';
import * as Message from '#src/disreact/codec/intrinsic/container/message.ts';
import * as Modal from '#src/disreact/codec/intrinsic/container/modal.ts';
import * as TextInput from '#src/disreact/codec/intrinsic/container/textinput.ts';
import * as Author from '#src/disreact/codec/intrinsic/embed/author.ts';
import * as Embed from '#src/disreact/codec/intrinsic/embed/embed.ts';
import * as Field from '#src/disreact/codec/intrinsic/embed/field.ts';
import * as Footer from '#src/disreact/codec/intrinsic/embed/footer.ts';
import * as Img from '#src/disreact/codec/intrinsic/embed/img.ts';
import * as Anchor from '#src/disreact/codec/intrinsic/markdown/a.ts';
import * as AtMention from '#src/disreact/codec/intrinsic/markdown/at.ts';
import * as Bold from '#src/disreact/codec/intrinsic/markdown/b.ts';
import * as BlockQuote from '#src/disreact/codec/intrinsic/markdown/blockquote.ts';
import * as Break from '#src/disreact/codec/intrinsic/markdown/br.ts';
import * as Code from '#src/disreact/codec/intrinsic/markdown/code.ts';
import * as Emoji from '#src/disreact/codec/intrinsic/markdown/emoji.ts';
import * as H1 from '#src/disreact/codec/intrinsic/markdown/h1.ts';
import * as H2 from '#src/disreact/codec/intrinsic/markdown/h2.ts';
import * as H3 from '#src/disreact/codec/intrinsic/markdown/h3.ts';
import * as Italic from '#src/disreact/codec/intrinsic/markdown/i.ts';
import * as ListItem from '#src/disreact/codec/intrinsic/markdown/li.ts';
import * as MaskAnchor from '#src/disreact/codec/intrinsic/markdown/mask.ts';
import * as OrderedList from '#src/disreact/codec/intrinsic/markdown/ol.ts';
import * as Paragraph from '#src/disreact/codec/intrinsic/markdown/p.ts';
import * as Pre from '#src/disreact/codec/intrinsic/markdown/pre.ts';
import * as Strikethrough from '#src/disreact/codec/intrinsic/markdown/s.ts';
import * as Small from '#src/disreact/codec/intrinsic/markdown/small.ts';
import * as Time from '#src/disreact/codec/intrinsic/markdown/time.ts';
import * as Underline from '#src/disreact/codec/intrinsic/markdown/u.ts';
import * as UnorderedList from '#src/disreact/codec/intrinsic/markdown/ul.ts';
import * as Channels from '#src/disreact/codec/intrinsic/select/channels.ts';
import * as Default from '#src/disreact/codec/intrinsic/select/default.ts';
import * as Mentions from '#src/disreact/codec/intrinsic/select/mentions.ts';
import * as Option from '#src/disreact/codec/intrinsic/select/option.ts';
import * as Roles from '#src/disreact/codec/intrinsic/select/roles.ts';
import * as Select from '#src/disreact/codec/intrinsic/select/select.ts';
import * as Users from '#src/disreact/codec/intrinsic/select/users.ts';
import * as E from 'effect/Effect';

const defaultDefinitions = [Actions, Button, Danger, Link, Premium, Primary, Secondary, Success, Ephemeral, Message, Modal, TextInput, Author, Embed, Field, Footer, Img, Anchor, AtMention, Bold, BlockQuote, Break, Code, Emoji, H1, H2, H3, Italic, ListItem, MaskAnchor, OrderedList, Paragraph, Pre, Strikethrough, Small, Time, Underline, UnorderedList, Channels, Default, Mentions, Option, Roles, Select, Users];

export const normalization = defaultDefinitions.reduce(
  (acc, def) => {
    acc[def.TAG] = def.NORM;
    return acc;
  },
  {} as Record<string, string>,
);

export const encoding = defaultDefinitions.reduce(
  (acc, def) => {
    acc[def.TAG] = def.encode;
    return acc;
  },
  {} as Record<string, (self: any, acc: any) => any>,
);

export const primitive = 'primitive';
