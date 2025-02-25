import {RDT} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';
import type * as RootHash from '#src/disreact/codec/entities/root-hash.ts';
import {decodeSync, encodeSync, String, TemplateLiteralParser} from 'effect/Schema';



export type Type = {
  _tag     : 'Message';
  static_id: string;
  id       : string;
  token    : RDT.Redacted;
  ephemeral: number;
  type     : number;
  ttl      : DateTime.Utc;
  hash     : RootHash.Encoded;
};



const parser = TemplateLiteralParser(
  '/dsx/',
  String,
  '/',
  String,
  '/',
  String,
  '/',
  String,
  '/',
  String,
  '/',
  String,
  '/',
  String,
);

const encoder = encodeSync(parser);
const decoder = decodeSync(parser);



export const encode = (route: Type): string => {
  return encoder([
    '/dsx/',
    route.static_id,
    '/',
    route.id,
    '/',
    `${route.ephemeral}`,
    '/',
    `${route.type}`,
    '/',
    `${route.ttl.epochMillis}`,
    '/',
    RDT.value(route.token),
    '/',
    route.hash,
  ]);
};



export const decode = (route: string): Type => {
  const [,static_id,,id,,ephemeral,,type,,ttl,,token,,hash] = decoder(route as never);

  return {
    _tag     : 'Message',
    static_id,
    id,
    ephemeral: Number(ephemeral),
    type     : Number(type),
    ttl      : DateTime.unsafeMake(Number(ttl)),
    token    : RDT.make(token),
    hash,
  };
};
