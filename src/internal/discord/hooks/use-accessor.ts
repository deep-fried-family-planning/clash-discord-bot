import type {HookId} from '#discord/hooks/context.ts';
import {addAccessorHook, getHooks} from '#discord/hooks/store-hooks.ts';
import {getParam, setParam} from '#discord/hooks/controller-params.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import console from 'node:console';
import type {Cx, ExV} from '..';


type EmbedToText = (embed: ExV.T) => Partial<Cx.E['Text']>;
type TextToEmbed = (text: Cx.E['Text']) => Partial<ExV.T>;
export type Accessor = readonly [HookId, EmbedToText, TextToEmbed];


export const useAccessor = (...[id, et, te]: Accessor) => {
  const accessor_id = `a_${id}`;

  return () => {
    const exists = getParam(accessor_id);

    if (exists === null) {
      addAccessorHook([accessor_id, et, te]);
      setParam(accessor_id, 'a');
    }

    return accessor_id;
  };
};


export const updateAccessorEmbeds = (
  embeds: ExV.T[],
  components: Cx.T[][],
) => {
  const hooks = getHooks();

  const flatComponents = components.flat();

  return hooks.accessors.reduce(
    (acc, [id, , textToEmbed]) => {
      const providingText = flatComponents.find((cx) => cx._tag === 'Text' && cx.route.accessor === id) as Maybe<Cx.E['Text']>;

      if (!providingText) {
        return acc;
      }

      console.log('accessor_embed', id);

      return acc.map((ex) => {
        if (ex._tag === 'AccessorEmbed' && ex.accessors.includes(id)) {
          console.log('accessor_embed_put', id, textToEmbed(providingText));
          return {
            ...ex,
            ...textToEmbed(providingText),
          };
        }
        return ex;
      });
    },
    embeds,
  );
};


export const updateAccessorDialogText = (
  embeds: ExV.T[],
  components: Cx.T[][],
) => {
  const hooks = getHooks();

  return hooks.accessors.reduce(
    (acc, [id, embedToText]) => {
      const providingEmbed = embeds.find((ex) => ex._tag === 'AccessorEmbed' && ex.accessors.includes(id));

      if (!providingEmbed) {
        return acc;
      }

      console.log('accessor_text', id);

      return acc.map((row) => row.map((cx) => {
        if (cx._tag === 'Text' && cx.route.accessor === id) {
          console.log('accessor_text_put', id, embedToText(providingEmbed));
          return {
            ...cx,
            data: {
              ...cx.data,
              ...embedToText(providingEmbed).data,
            },
          } as typeof cx;
        }
        return cx;
      }));
    },
    components,
  );
};


// export const updateAccessorDialogText = (
//   accessors: Accessor[],
//   embeds: ExV.T[],
//   components: Cx.T[][],
// ) => {
//   return accessors.reduce(
//     (acc, [id, embedToText, textToEmbed]) => {
//       const providingEmbed = acc.exs.find((ex) => ex._tag === 'AccessorEmbed' && ex.accessors.includes(id));
//       const providingText  = acc.cxs.flat().find((cx) => cx._tag === 'Text' && cx.route.accessor === id);
//
//       acc.exs = !providingText
//         ? acc.exs
//         : acc.exs.map((ex) => {
//           if (ex._tag === 'AccessorEmbed' && ex.accessors.includes(id)) {
//             return {
//               ...ex,
//               ...textToEmbed(providingText),
//             };
//           }
//
//           return ex;
//         });
//
//       acc.cxs = !providingEmbed
//         ? acc.cxs
//         : acc.cxs.map((row) => row.map((cx) => {
//           if (cx._tag === 'Text' && cx.route.accessor === id) {
//             return {
//               ...cx,
//               ...embedToText(providingEmbed),
//             };
//           }
//           return cx;
//         }));
//
//       return acc;
//     },
//     {
//       exs: embeds,
//       cxs: components,
//     },
//   );
// };
