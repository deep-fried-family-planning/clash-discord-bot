import type {Cv, Cx, Ev, Ex} from '#discord/entities/basic/index.ts';
import type {VoidOrVoidEffect} from '#discord/entities/basic/node-view.ts';
import {D} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type RenderedNode = {
  embeds    : Ex.Grid;
  components: Cx.Grid;
};

export type ShallowNode = {
  custom_id?: str;
  title?    : str;
  onSubmit? : VoidOrVoidEffect;
  embeds    : Ev.Grid;
  components: Cv.Grid;
};


export type Meta = {
  path: Cx.Path;
  name: str;
};

export type T = D.TaggedEnum<{
  Message: Meta & {components: Cx.Grid; embeds: Ex.Grid};
  Dialog : Meta & {components: Cx.Grid; embeds: Ex.Grid; title: str};
}>;


export const E       = D.taggedEnum<T>();
export const match   = E.$match;
export const is      = E.$is;
export const pure    = <A extends T>(a: A) => a;
export const mapTo   = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapSame = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);


export const Message = E.Message;
export const Dialog  = E.Dialog;


// export const encode = (driver: Driver) => match({
//   Entry: (nx) => ({
//     embeds    : [],
//     components: [],
//   }) as RestEncodeMessage,
//
//   Message: (nx) => ({
//     embeds    : [],
//     components: [],
//   }) as RestEncodeMessage,
//
//   Dialog: (nx) => ({
//     custom_id: pipe(
//       nx.path,
//       Path.set('root', driver.name),
//       Path.set('view', nx.name),
//       Path.set('dialog', nx.name),
//       Path.set('mod', DIALOG),
//       Path.build,
//     ),
//     title     : nx.title,
//     components: pipe(
//       nx.cxs,
//       Cx.mapGrid((cx) => pipe(
//         cx,
//         Cx.set('route', pipe(
//           cx.path,
//           Cx.Path.set('root', driver.name),
//           Cx.Path.set('view', nx.name),
//           Cx.Path.set('dialog', nx.name),
//           Cx.Path.set('mod', DIALOG),
//         )),
//       )),
//       Cx.encodeGrid(driver, nx),
//     ),
//   }) as RestEncodeDialog,
// });
