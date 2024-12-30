import type {HookId} from '#discord/context/context.ts';
import {getParam, setParam} from '#discord/context/controller-params.ts';
import type {Cx, Ex} from '#discord/entities/basic';
import {addAccessorHook, getHooks} from '#discord/entities/hooks/hooks.ts';


type EmbedToText = (embed: Ex.Data) => Partial<Cx.E['Text']>;
type TextToEmbed = (text: Cx.E['Text']['data']) => Partial<Ex.T['data']>;
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
  embeds: Ex.Grid,
  components: Cx.Grid,
) => {
  const hooks = getHooks();

  const flatComponents = components.flat();

  return hooks.accessors.reduce(
    (acc, [id, , textToEmbed]) => {
      const providingText = flatComponents.find((cx) => cx._tag === 'Text' && cx.path.ref === id);

      if (!providingText) {
        return acc;
      }

      return acc.map((ex) => {
        if (ex._tag === 'DialogLinked' && ex.refs.includes(id)) {
          return {
            ...ex,
            data: {
              ...ex.data,
              ...textToEmbed((providingText as Cx.E['Text']).data),
            },
          } as typeof ex;
        }
        return ex;
      });
    },
    embeds,
  );
};


export const updateDialogRefComponents = (
  embeds: Ex.Grid,
  components: Cx.Grid,
) => {
  const hooks = getHooks();

  return hooks.accessors.reduce(
    (acc, [id, embedToText]) => {
      const providingEmbed = embeds.find((ex) => ex._tag === 'DialogLinked' && ex.refs.includes(id));

      if (!providingEmbed) {
        return acc;
      }

      return acc.map((row) => row.map((cx) => {
        if (cx._tag === 'Text' && cx.path.ref === id) {
          return {
            ...cx,
            data: {
              ...cx.data,
              ...embedToText(providingEmbed.data),
            },
          } as typeof cx;
        }
        return cx;
      }));
    },
    components,
  );
};
