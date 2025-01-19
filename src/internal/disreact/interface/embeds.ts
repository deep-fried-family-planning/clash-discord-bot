import {D} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {type DA, Em, Rf} from '#src/internal/disreact/model/entities/index.ts';
import {EmbedRoute, MainRoute} from '#src/internal/disreact/model/route/index.ts';


export type T = D.TaggedEnum<{
  Header    : DA.Embed & {ref?: Rf.T};
  Body      : DA.Embed & {ref?: Rf.T};
  DialogLink: DA.Embed & {ref: Rf.T; refs: Rf.DialogLinked[]};
}>;


export const T = D.taggedEnum<T>();


export const Header = T.Header;
export const Body = T.Body;
export const DialogLink = T.DialogLink;


export const asModel = (ei: T): Em.T => {
  if (ei._tag === 'Header') {
    const {_tag, ref = Rf.Default({id: NONE}), ...data} = ei;
    return Em.Main({
      route: MainRoute.empty(),
      data,
      ref,
    });
  }
  if (ei._tag === 'Body') {
    const {_tag, ref = Rf.Default({id: NONE}), ...data} = ei;
    return Em.Basic({
      route: EmbedRoute.empty(),
      ref,
      data,
    });
  }
  const {_tag, ref, refs, ...data} = ei;
  return Em.DialogLinked({
    route: EmbedRoute.empty(),
    ref,
    refs,
    data,
  });
};

export const modelAll = (eis: T[]): Em.T[] => eis.map(asModel);
