import type * as RootHash from '#src/disreact/codec/entities/root-hash.ts';
import type {DT} from '#src/internal/pure/effect.ts';
import {RDT} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';
import {decodeSync, encodeSync, Redacted, String, Struct, tag, TemplateLiteralParser, Number, DateTimeUtc} from 'effect/Schema';



export const Type = Struct({
  _tag     : tag('Message'),
  root_id  : String,
  id       : String,
  token    : Redacted(String),
  ephemeral: Number,
  type     : Number,
  ttl      : DateTimeUtc,
  hash     : String,
});



export type Type = {
  _tag     : 'Message';
  root_id  : string;
  id       : string;
  token    : RDT.Redacted;
  ephemeral: number;
  type     : number;
  ttl      : DT.Utc;
  hash     : RootHash.Encoded;
};



const parser = TemplateLiteralParser(
  '/dsx',
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
  '/',
  String,
);

const encoder = encodeSync(parser);
const decoder = decodeSync(parser);



export const encode = (route: Type): string => encoder([
  '/dsx',
  '/', route.root_id,
  '/', route.id,
  '/', `${route.ephemeral}`,
  '/', `${route.type}`,
  '/', `${route.ttl.epochMillis}`,
  '/', RDT.value(route.token),
  '/', route.hash,
]);



export const decode = (route: string): Type => {
  const [, root_id, , id, , ephemeral, , type, , ttl, , token, , hash] = decoder(route as never);

  return {
    _tag     : 'Message',
    root_id  : root_id,
    id,
    ephemeral: parseInt(ephemeral),
    type     : parseInt(type),
    ttl      : DateTime.unsafeMake(parseInt(ttl)),
    token    : RDT.make(token),
    hash,
  };
};
