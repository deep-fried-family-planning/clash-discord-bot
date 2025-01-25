import {Cm, Co, Em, Rf} from '#disreact/virtual/entities/index.ts';
import {Ar, Kv, pipe} from '#pure/effect';



export const restoreMessageFromMessage = (
  node: Co.Message,
  rest: Co.Message,
): Co.Message => {
  const componentRestRefs = pipe(
    rest.components,
    Ar.flatten,
    Ar.filter((c) => c.ref !== undefined),
    Ar.filter((c) => !Rf.isRestComponent(c.ref)),
    Kv.fromIterableWith((c) => [c.ref!.id, {ref: c.ref!, current: c}]),
  );

  const embedRestRefs = pipe(
    rest.embeds,
    Ar.filter((c) => c.ref !== undefined),
    Ar.filter((c) => Rf.isRestEmbed(c.ref) || Rf.isDialogLinked(c.ref)),
    Kv.fromIterableWith((c) => [c.ref!.id, {ref: c.ref!, current: c}]),
  );

  return pipe(
    node,
    Co.mapComponents((c) => {
      if (!(c.ref!.id in componentRestRefs)) {
        return c;
      }
      return Cm.T[c._tag]({
        ...c,
        data: {
          ...c.data,
          ...componentRestRefs[c.ref!.id].current.data,
        } as never,
      });
    }),
    Co.mapEmbeds((e) => {
      if (!(e.ref!.id in embedRestRefs)) {
        return e;
      }
      return Em.T[e._tag]({
        ...e,
        data: {
          ...e.data,
          ...embedRestRefs[e.ref!.id].current.data,
        },
      } as never);
    }),
  );
};


export const restoreMessageFromDialog = (
  message: Co.Message,
  dialog: Co.Dialog,
): Co.Message => {
  const componentRestRefs = pipe(
    dialog.components,
    Ar.flatten,
    Ar.filter((c) => c.ref !== undefined),
    Ar.filter((c) => !Rf.isRestComponent(c.ref)),
    Kv.fromIterableWith((c) => [c.ref!.id, {ref: c.ref!, current: c}]),
  );

  return pipe(
    message,
  );
};


export const restoreDialogFromMessage = (
  message: Co.Message,
) => (
  dialog: Co.Dialog,
): Co.Dialog => {
  const componentRestRefs = pipe(
    message.components,
    Ar.flatten,
    Ar.filter((c) => c.ref !== undefined),
    Ar.filter((c) => !Rf.isRestComponent(c.ref)),
    Kv.fromIterableWith((c) => [c.ref!.id, {ref: c.ref!, current: c}]),
  );

  return pipe(
    dialog,
  );
};
