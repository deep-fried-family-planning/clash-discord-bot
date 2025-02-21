import {DateTimeUtcFromNumber, mutable, NumberFromString, String, Struct, TemplateLiteralParser} from 'effect/Schema';
import * as Doken from './doken.ts';



export const MessageParams = Struct({
  root : String,
  doken: Doken.Type,
  hash : String,
});



export const MessageParser = TemplateLiteralParser(
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
