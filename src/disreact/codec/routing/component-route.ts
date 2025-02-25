import {decodeSync, encodeSync, String, TemplateLiteralParser} from 'effect/Schema';



export type Type = {
  _tag: 'Component';
  id  : string;
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
    route.id,
  ]);
};



export const decode = (route: string): Type => {
  const [, id] = decoder(route as never);

  return {
    _tag: 'Component',
    id,
  };
};
