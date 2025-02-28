import {S} from '#src/internal/pure/effect.ts';
import {decodeSync, encodeSync, String, TemplateLiteralParser} from 'effect/Schema';
// import * as S from 'effect/Schema';



export const Type = S.Struct({
  _tag   : S.tag('Dialog'),
  root_id: S.String,
});



export type Type = {
  _tag     : 'Dialog';
  static_id: string;
};



const parser = S.TemplateLiteralParser(
  '/dsx/',
  String,
);

const encoder = S.encodeSync(parser);
const decoder = S.decodeSync(parser);



export const encode = (route: Type): string => {
  return encoder([
    '/dsx/',
    route.static_id,
  ]);
};



export const decode = (route: string): Type => {
  const [,static_id] = decoder(route as never);

  return {
    _tag: 'Dialog',
    static_id,
  };
};
