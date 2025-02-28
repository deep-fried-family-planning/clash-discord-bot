import {decodeSync, encodeSync, String, Struct, tag, TemplateLiteralParser, type Schema} from 'effect/Schema';



export const Type = Struct({
  _tag: tag('Component'),
  id  : String,
});

export type Type = Schema.Type<typeof Type>;



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
