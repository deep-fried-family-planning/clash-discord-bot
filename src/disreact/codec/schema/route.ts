import {Rest} from '#src/disreact/codec/abstract/index.ts';
import {Struct, String, mutable, optional, NumberFromString, DateTimeUtcFromNumber, TemplateLiteralParser} from 'effect/Schema';



export const MainParameters = Struct({
  root : String,
  doken: mutable(Struct({
    app  : String,
    id   : String,
    token: String,
    ttl  : DateTimeUtcFromNumber,
    type : NumberFromString,
    flags: NumberFromString,
  })),
  hash: String,
});



export const MainSerialized = TemplateLiteralParser(
  '/dsx/',
  String,
  '/',
  String,
  '/',
  NumberFromString,
  '/',
  String,
  '/',
  String,
  '/',
  String,
);
