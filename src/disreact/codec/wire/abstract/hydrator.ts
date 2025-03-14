/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {CustomId} from '#src/disreact/codec/dapi/index.ts';
import * as DAPI from '#src/disreact/codec/wire/dapi.ts';
import * as Doken from '#src/disreact/codec/wire/doken.ts';
import {ForbiddenSync} from '#src/disreact/codec/wire/shared/shared.ts';
import {String, Struct, TaggedStruct, TemplateLiteralParser, transform, Union} from 'effect/Schema';
import * as Ix from './ix.ts';



export const HYDRATION        = 'EmbedImageUrl' as const;
export const HYDRATION_PREFIX = 'https://dffp.org' as const;
export const COMPONENT        = 'DataComponent' as const;
export const COMPONENT_PREFIX = '/c' as const;
export const MODAL            = 'DataModal' as const;
export const MODAL_PREFIX     = '/m' as const;



export const Component = TaggedStruct(COMPONENT, {
  custom_id: String,
});

export const Modal = TaggedStruct(MODAL, {
  root_id  : String,
  custom_id: String,
});

export const Hydration = TaggedStruct(HYDRATION, {
  root_id: String,
  hash   : String,
  doken  : Union(Doken.Cache, Doken.Defer, Doken.Spent),
});



export const ComponentPack = transform(
  TemplateLiteralParser(
    COMPONENT_PREFIX,
    '/', String,
  ),
  Component,
  {
    strict: true,
    decode: ([, , custom_id]) =>
      ({
        _tag: COMPONENT,
        custom_id,
      } as const),
    encode: ({custom_id}) =>
      [
        COMPONENT_PREFIX, '/', custom_id,
      ] as const,
  },
);

export const ModalPack = transform(
  TemplateLiteralParser(
    MODAL_PREFIX,
    '/', String,
    '/', String,
  ),
  Modal,
  {
    strict: true,
    decode: ([, , root_id, , custom_id]) =>
      ({
        _tag: MODAL,
        root_id,
        custom_id,
      }),
    encode: ({root_id, custom_id}) =>
      [
        MODAL_PREFIX, '/', root_id, '/', custom_id,
      ] as const,
  },
);

export const HydrationPack = transform(
  TemplateLiteralParser(
    HYDRATION_PREFIX,
    '/', Doken.Pack,
    '/', String,
    '/', String,
  ),
  Hydration,
  {
    strict: true,
    decode: ([, , doken, , root_id, , hash]) =>
      ({
        _tag: HYDRATION,
        root_id,
        hash,
        doken,
      }),
    encode: ({root_id, hash, doken}) =>
      [
        HYDRATION_PREFIX, '/', doken, '/', root_id, '/', hash,
      ] as const,
  },
);

export const HydrationRelay = Struct({
  params: HydrationPack,
  data  : DAPI.BaseMessage,
});

export const HydrationFromMessage = transform(
  DAPI.BaseMessage,
  HydrationRelay,
  {
    strict: true,
    decode: (message) => {
      const url = message.embeds?.at(0)?.image?.url;

      if (!url) {
        throw ForbiddenSync();
      }

      return {
        params: url as any,
        data  : message,
      };
    },
    encode: ({params, data}) => {
      const embeds = data.embeds;
      const embed  = embeds?.at(0);
      const url    = embed?.image?.url;

      if (!embeds || !embed || !url) {
        throw ForbiddenSync();
      }

      const hydration = {
        ...embed,
        image: {
          url: params,
        },
      };

      const [, ...rest] = embeds;

      return {...data, embeds: [hydration, ...rest]};
    },
  },
);



export const ComponentFromRequest = transform(
  Ix.ComponentRequest,
  ComponentPack,
  {
    strict: true,
    decode: (request) => request.data.custom_id as any,
    encode: ForbiddenSync,
  },
);

export const ModalFromRequest = transform(
  Ix.ModalRequest,
  ModalPack,
  {
    strict: true,
    decode: (request) => request.data.custom_id as any,
    encode: ForbiddenSync,
  },
);

export const HydrationFromRequest = transform(
  Ix.InteractionRequest,
  HydrationFromMessage,
  {
    strict: true,
    decode: (request) => {
      if (!request.message) {
        throw ForbiddenSync();
      }
      return request.message;
    },
    encode: ForbiddenSync,
  },
);

//
//
// export const HydrationUrl = TaggedStruct(HYDRATION, {
//   root_id: FiberRoot.S.RootId,
//   hash   : FiberRoot.S.FiberHash,
//   doken  : Doken.S.Parsed,
// });
//
// export const HydrationUrlTemplate = TemplateLiteralParser(
//   HYDRATION_PREFIX,
//   '/', FiberRoot.S.RootId,
//   '/', FiberRoot.S.FiberHashFromString,
//   '/', Doken.S.Fresh,
// );
//
// export const HydrationUrlParser = transform(HydrationUrlTemplate, HydrationUrl, {
//   strict: true,
//   decode: (a) => {
//     return {
//       _tag   : HYDRATION,
//       root_id: a[2],
//       hash   : a[4],
//       doken  : a[6],
//     } as const;
//   },
//   encode: (i) => {
//     return [
//       HYDRATION_PREFIX,
//       '/', i.root_id,
//       '/', i.hash,
//       '/', i.doken,
//     ] as const;
//   },
// });
//
// export const HydrationUrlExtraction = transform(
//   DAPI.Message,
//   HydrationUrlParser,
//   {
//     strict: false,
//     decode: (a) => {
//       if (!a.embeds?.[0].image?.url) {
//         return ParseResult.Type;
//       }
//       return a.embeds[0].image.url;
//     },
//     encode: ForbiddenEncode,
//   },
// );
//
// export const HydrationUrlInjection = transform(
//   DAPI.Message,
//   Struct({
//     params : HydrationUrlParser,
//     message: DAPI.Message,
//   }),
//   {
//     strict: false,
//     decode: ForbiddenDecode,
//     encode: (i) => {
//       return {
//         ...i.message,
//         embeds: i.message.embeds?.with(0, {
//           ...i.message.embeds.at(0),
//           image: {
//             url: i.params,
//           },
//         }),
//       };
//     },
//   },
// );
//
//
// export const ComponentIdFromData = transform(DAPI.ComponentData, ComponentFromString, {
//   strict: false,
//   decode: (a) => {
//     return a.custom_id;
//   },
//   encode: ForbiddenSync,
// });
