import {S} from '#src/disreact/utils/re-exports.ts';
import {DAPI} from './dapi/dapi.ts';
import {Template} from './template.ts';

export * as Params from '#src/disreact/codec/params.ts';
export type Params = never;

export const Modal = S.transform(
  S.typeSchema(DAPI.Modal.Any),
  S.Struct({
    params: Template.SourceCustomId,
    data  : S.typeSchema(DAPI.Modal.Any),
  }),
  {
    encode: ({params, data}) =>
      ({
      ...data,
      custom_id: params,
    }),
    decode: (data) =>
      ({
        params: data.custom_id as any,
        data,
      }),
  },
);

export const Message = S.transform(
  S.typeSchema(DAPI.Message.Base),
  S.Struct({
    params: Template.DokenRehydrantUrl,
    data  : S.typeSchema(DAPI.Message.Base),
  }),
  {
    encode: ({params, data}) =>
      ({
        ...data,
        embeds: data.embeds?.with(0, {
          ...data.embeds.at(0),
          image: {
            ...data.embeds.at(0)?.image,
            url: params,
          },
        }),
      }),
    decode: (data) => {
      if (!data.embeds?.[0].image?.url) {
        throw new Error();
      }
      return {
        params: data.embeds[0].image.url as any,
        data  : data,
      };
    },
  },
);
