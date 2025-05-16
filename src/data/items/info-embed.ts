import {Document} from '#src/data/arch/index.ts';
import * as Table from '#src/data/arch/Table.ts';
import {DataTag} from '#src/data/constants/index.ts';
import * as S from 'effect/Schema';
import {ApiEmbed} from './util';

export type InfoEmbed = typeof InfoEmbedLV.Type;

export const InfoEmbedKey = Table.Key({
  pk: S.String,
  sk: S.tag('.'),
});

export const TAG = DataTag.DISCORD_EMBED;
export const LATEST = 0;

export const InfoEmbedLV = Table.Item(TAG, LATEST, {
  pk   : S.String,
  sk   : S.tag('.'),
  embed: ApiEmbed,
});

export const InfoEmbedVS = S.Union(
  InfoEmbedLV,
);

export type Type = typeof InfoEmbedLV.Type;
export type Encoded = typeof InfoEmbedLV.Encoded;
export const is = S.is(InfoEmbedLV);
export const make = InfoEmbedLV.make;
export const equal = S.equivalence(InfoEmbedLV);
export const decode = S.decode(InfoEmbedVS);
export const encode = S.encode(InfoEmbedLV);

export const createInfoEmbed = Document.Put(InfoEmbedLV);
export const update = Document.Update(InfoEmbedKey);
export const read = Document.Get(InfoEmbedKey, InfoEmbedVS);
const $delete = Document.Delete(InfoEmbedKey);
export {$delete as delete};

export const put = Document.Put(InfoEmbedLV);
export const get = Document.GetUpgrade(InfoEmbedKey, InfoEmbedVS);
export const del = Document.Delete(InfoEmbedKey);
