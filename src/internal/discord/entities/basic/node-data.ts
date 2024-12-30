import {updateUrlContext} from '#discord/context/context.ts';
import {Cv, Cx, Ev, Ex, Nv, Nx, Tx} from '#discord/entities/basic/index.ts';
import {parseOutput} from '#discord/entities/basic/node-view.ts';
import {DeveloperError} from '#discord/entities/errors/developer-error.ts';
import {updateDialogRefComponents, updateDialogRefEmbeds} from '#discord/entities/hooks/use-dialog-ref.ts';
import {updateUseEffect} from '#discord/entities/hooks/use-effect.ts';
import {updateRxRefs} from '#discord/entities/hooks/use-rest-ref.ts';
import type {IxIn} from '#discord/types.ts';
import {type RestDataComponent, type RestDataDialog, RxType} from '#pure/dfx';
import {D, E as Effect, g, p, pipe} from '#pure/effect';
import type {str, unk} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';


export type Meta = {
  name: str;
  root: str;
  view: str;
  mod?: str;
};

export type T = D.TaggedEnum<{
  Message: Meta & {components: Cx.Grid; embeds: Ex.Grid};
  Dialog : Meta & {components: Cx.Grid; embeds: Ex.Grid; title: str};
}>;


export const E         = D.taggedEnum<T>();
export const match     = E.$match;
export const is        = E.$is;
export const Message   = E.Message;
export const Dialog    = E.Dialog;
export const isMessage = is('Message');
export const isDialog  = is('Dialog');


export const decodeDialog = (ix: IxIn) => {
  if (ix.type !== RxType.MODAL_SUBMIT) {
    throw new DeveloperError({});
  }

  const path = Cx.Path.parse(ix.data.custom_id);
  const data = ix.data as RestDataDialog;

  return Dialog({
    name      : path.view,
    root      : path.root,
    view      : path.view,
    mod       : path.mod,
    title     : data.custom_id,
    embeds    : [],
    components: Cx.decodeGrid(data.components),
  });
};


export const decodeMessage = (ix: IxIn) => {
  const path = Cx.Path.parse(ix.data.custom_id);
  const data = ix.data as unk as RestDataComponent;

  return Message({
    name      : path.view,
    root      : path.root,
    view      : path.view,
    embeds    : Ex.decodeGrid(ix.message?.embeds),
    components: pipe(
      Cx.decodeGrid(ix.message?.components),
      Cx.mapGrid((cx) => pipe(
        cx,
        Cx.setSelectedOptions(path, data),
      )),
    ),
  });
};


export const encodeDialog = (rx: T) => (nx: T) => {
  if (isDialog(rx) || isMessage(nx)) {
    throw new DeveloperError({});
  }

  const path = {
    ...Cx.Path.empty(),
    root  : nx.root,
    view  : nx.view,
    dialog: nx.title,
    mod   : nx.mod!,
  };

  return Tx.Dialog({
    custom_id : Cx.Path.build(path),
    title     : nx.title,
    components: p(
      nx.components,
      updateDialogRefComponents(rx.embeds),
      Cx.encodeGrid(nx.root, nx.view),
    ),
  });
};


export const encodeMessage = (rx_message?: T, rx_dialog?: T) => (nx: T) => {
  if (isDialog(nx)) {
    throw new DeveloperError({});
  }
  if (rx_dialog && !isDialog(rx_dialog)) {
    throw new DeveloperError({});
  }
  if (rx_message && !isMessage(rx_message)) {
    throw new DeveloperError({});
  }

  if (rx_message && rx_dialog && isDialog(rx_dialog)) {
    const embeds = p(
      nx.embeds,
      updateDialogRefEmbeds(rx_dialog.components),
      updateUrlContext,
      Ex.encodeGrid(),
    );

    return Tx.Message({
      embeds,
      components: p(
        nx.components,
        updateRxRefs(rx_message.components),
        Cx.encodeGrid(nx.root, nx.view),
      ),
    });
  }

  if (rx_message) {
    const embeds = p(
      nx.embeds,
      Ex.addRxLinks(rx_message.embeds),
      updateUrlContext,
      Ex.encodeGrid(),
    );

    return Tx.Message({
      embeds,
      components: p(
        nx.components,
        updateRxRefs(rx_message.components),
        Cx.encodeGrid(nx.root, nx.view),
      ),
    });
  }

  const embeds = p(
    nx.embeds,
    updateUrlContext,
    Ex.encodeGrid(),
  );

  return Tx.Message({
    embeds    : embeds,
    components: p(nx.components, Cx.encodeGrid(nx.root, nx.view)),
  });
};


export const renderViewNode = (nv: Nv.T, ix?: IxIn) => g(function * () {
  nv.func();
  yield * updateUseEffect;

  if (Nv.is('Dialog')(nv)) {
    if (!ix) {
      throw new DeveloperError({});
    }

    const [dialog, ...cvs] = nv.func();

    console.log('[view_dialog]');
    const components = p(cvs, Cv.mapGrid(Cv.make(nv.path.root, nv.name)));

    return Nx.Dialog({
      name      : nv.name,
      root      : nv.path.root,
      view      : nv.name,
      title     : dialog.title,
      mod       : ix.id,
      embeds    : [],
      components: components,
    });
  }

  const [evs, cvs] = parseOutput(nv.func());
  const embeds     = p(evs, Ev.mapGrid(Ev.make(nv.path.root, nv.name)));
  const components = p(cvs, Cv.mapGrid(Cv.make(nv.path.root, nv.name)));

  return Nx.Message({
    name      : nv.name,
    root      : nv.path.root,
    view      : nv.name,
    embeds    : embeds,
    components: components,
  });
});


export const simulateViewNodeClick = (action: RestDataComponent) => (nx: T) => g(function * () {
  if (isDialog(nx)) {
    throw new DeveloperError({});
  }

  const path      = Cx.Path.parse(action.custom_id);
  const component = nx.components.at(path.row)?.at(path.col);

  console.log('click', action.custom_id);

  if (!component || !component.onClick) {
    throw new DeveloperError({});
  }

  const func = component.onClick({
    target  : component.data as never,
    selected: Cx.getSelectedValues(component),
    values  : Cx.getSelectedOptions(component) as never,
    options : Cx.getOptions(component) as never,
  });

  if (Effect.isEffect(func)) {
    yield * func;
  }

  return nx;
});
