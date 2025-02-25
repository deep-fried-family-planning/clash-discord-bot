import {decodeSync, encodeSync, String, TemplateLiteralParser} from 'effect/Schema';

export type Type = {
  _tag     : 'Dialog';
  static_id: string;
};



const parser = TemplateLiteralParser(
  '/dsx/',
  String,
);

const encoder = encodeSync(parser);
const decoder = decodeSync(parser);



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
