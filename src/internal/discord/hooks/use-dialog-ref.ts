import type {HookId} from '#discord/context/context.ts';
import {getParam, setParam} from '#discord/context/controller-params.ts';
import type {Cx, Ex} from '#discord/entities';
import {addAccessorHook, getHooks} from '#discord/hooks/hooks.ts';
import type {Maybe} from '#src/internal/pure/types.ts';


type EmbedToText = (embed: Ex.Type) => Partial<Cx.E['Text']>;
type TextToEmbed = (text: Cx.E['Text']) => Partial<Ex.Type>;
export type Accessor = readonly [HookId, EmbedToText, TextToEmbed];


export const useDialogRef = (...[id, et, te]: Accessor) => {
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


export const updateDialogRefEmbeds = (
  embeds: Ex.Type[],
  components: Cx.Type[][],
) => {
  const hooks = getHooks();

  const flatComponents = components.flat();

  return hooks.accessors.reduce(
    (acc, [id, , textToEmbed]) => {
      const providingText = flatComponents.find((cx) => cx._tag === 'Text' && cx.route.accessor === id) as Maybe<Cx.E['Text']>;

      if (!providingText) {
        return acc;
      }

      return acc.map((ex) => {
        if (ex._tag === 'AccessorEmbed' && ex.accessors.includes(id)) {
          return {
            ...ex,
            ...textToEmbed(providingText),
          } as typeof ex;
        }
        return ex;
      });
    },
    embeds,
  );
};


export const updateDialogRefComponents = (
  embeds: Ex.Type[],
  components: Cx.Type[][],
) => {
  const hooks = getHooks();

  return hooks.accessors.reduce(
    (acc, [id, embedToText]) => {
      const providingEmbed = embeds.find((ex) => ex._tag === 'AccessorEmbed' && ex.accessors.includes(id));

      if (!providingEmbed) {
        return acc;
      }

      return acc.map((row) => row.map((cx) => {
        if (cx._tag === 'Text' && cx.route.accessor === id) {
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
