import * as Spec from '#disreact/codec/JsxSpec.ts';
import {decode, encode} from '@msgpack/msgpack';
import {Discord} from 'dfx';
import * as S from 'effect/Schema';
import {URL} from 'node:url';
import {deflate, inflate} from 'pako';
import type * as DiscordIO from './DiscordIO.ts';

const RehydrantId = S.TemplateLiteralParser(
  ...Spec.ControlledId.params,
  '/', S.String,
);

export const isRehydrantFragment = S.is(RehydrantId);

const flattenComponents = (components?: any[]): Discord.AllComponents[] =>
  components?.flatMap((c) => {
    if (c.accessory) {
      return [c, c.accessory, ...c.components];
    }
    if (c.components) {
      return [c, ...flattenComponents(c.components)];
    }
    return [c];
  })
  ?? [];

const unsafeParseComponents = (components: Discord.AllComponents[]) =>
  components.map((c) => {
    if (
      'custom_id' in c &&
      isRehydrantFragment(c.custom_id)
    ) {
      const [i, f] = c.custom_id.split('/');
      (c.custom_id as any) = i;
      return f;
    }
    return '';
  }).join();

const unsafeMergeComponents = (components: Discord.AllComponents[], hydrator: string) =>
  components.reduce((h, c) => {
    if (
      'custom_id' in c &&
      Spec.isControlledId(c.custom_id) &&
      c.custom_id.length < 99
    ) {
      const a = 99 - c.custom_id.length;
      const f = h.substring(0, a);
      (c.custom_id as any) = `${c.custom_id}/${f}`;
      return h.substring(a);
    }
    return h;
  }, hydrator);

const unsafeParseEmbeds = (embeds?: Discord.RichEmbed[]) =>
  embeds?.map((e) => {
    if (!e.image?.url) {
      return '';
    }
    const url = new URL(e.image.url);

    if (url.pathname.startsWith('/_')) {
      const fragment = url.pathname.substring(1);
      url.pathname = '';
      (e.image.url as any) = url.href;
      return fragment;
    }
    return '';
  }).join()
  ?? '';

const unsafeMergeEmbeds = (embeds: Discord.RichEmbed[], hydrator: string) =>
  embeds.reduce((h, e) => {
    if (
      e.image?.url &&
      isRehydrantFragment(e.image.url)
    ) {
      const fragment = e.image.url.substring(e.image.url.indexOf('/') + 1);
      (e.image.url as any) = fragment;
      return h.replace(fragment, '');
    }
    return h;
  }, hydrator);

const unsafeUnpack = (str: string) => {
    const buff = Buffer.from(str, 'base64url');
    const pako = inflate(buff);
    return decode(pako) as any;
};

const unsafePack = (obj: any) => {
    const pack = encode(obj);
    const pako = deflate(pack);
    return Buffer.from(pako).toString('base64url');
};

export const parseInteraction = (ix: DiscordIO.InteractionInput) => {
  const components = flattenComponents(ix.message?.components);
  const hydrator = unsafeParseComponents(components) +
                   unsafeParseEmbeds(ix.message?.embeds);

  return {
    components: components,
    hydrator  : unsafeUnpack(hydrator),
  };
};

export const mergeInteractable = (ix: DiscordIO.Interactable, params: any) => {
  const hydrator = unsafePack(params);

  if ('custom_id' in ix) {
    return ix;
  }
  if ('embeds' in ix) {
    if (ix.components) {
      const remaining = unsafeMergeEmbeds(
        ix.embeds as any,
        unsafeMergeComponents(ix.components as any, hydrator),
      );
      if (remaining.length) {
        throw new Error();
      }
      return ix;
    }
  }
  if (!ix.components) {

  }
};

const Type = Discord.MessageComponentTypes;
