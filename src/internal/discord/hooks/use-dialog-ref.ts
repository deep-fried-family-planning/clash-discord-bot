import type {HookId} from '#discord/context/context.ts';
import {getParam, setParam} from '#discord/context/controller-params.ts';
import type {Cx, Ex} from '#discord/entities';
import {addAccessorHook, getHooks} from '#discord/hooks/hooks.ts';
import console from 'node:console';


type EmbedToText = (embed: Ex.T['data']) => Partial<Cx.E['Text']['data']>;
type TextToEmbed = (text: Cx.E['Text']['data']) => Partial<Ex.T['data']>;
export type Accessor = readonly [HookId, EmbedToText, TextToEmbed];


export const useDialogRef = (...[id, et, te]: Accessor) => {
  const accessor_id = `a_${id}`;

  return () => {
    const exists = getParam(accessor_id);

    if (exists === null) {
      addAccessorHook([accessor_id, et, te]);
      setParam(accessor_id, 'a');
      console.log('useDialogRef', accessor_id);
    }

    return accessor_id;
  };
};


export const updateDialogRefEmbeds = (components: Cx.Grid) => (embeds: Ex.Grid) => {
  const hooks = getHooks();

  const flatComponents = components.flat();

  return hooks.accessors.reduce(
    (acc, [id, , textToEmbed]) => {
      const providingText = flatComponents.find((cx) => cx._tag === 'Text' && cx.path.ref === id);

      if (!providingText) {
        return acc;
      }

      return acc.map((ex) => {
        console.log('embed refs', ex._tag === 'DialogLinked' && ex.refs);
        if (ex._tag === 'DialogLinked' && ex.refs.includes(id)) {
          console.log('updateDialogRefEmbeds');
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


export const updateDialogRefComponents = (embeds: Ex.Grid) => (components: Cx.Grid) => {
  const hooks = getHooks();

  return hooks.accessors.reduce(
    (acc, [id, embedToText]) => {
      const providingEmbed = embeds.find((ex) => ex._tag === 'DialogLinked' && ex.refs.includes(id));

      if (!providingEmbed) {
        return acc;
      }

      return acc.map((row) => row.map((cx) => {
        if (cx._tag === 'Text' && cx.path.ref === id) {
          console.log('updateDialogRefComponents');
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
