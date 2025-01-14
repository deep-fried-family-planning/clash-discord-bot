import type {RestEmbed, RestText} from '#pure/dfx';
import type {E} from '#pure/effect';
import {D} from '#pure/effect';
import type {Ev} from '#src/internal/disreact/entity/index.ts';
import type {id, idk, ne, opt, str} from '#src/internal/pure/types-pure.ts';


export type SyncCall = D.TaggedEnum<{
  State     : {id: id; data: {state: str}};
  UseReducer: {
    id     : id;
    initial: idk;
    restore: (rest: idk) => idk;
    reduce : (state: idk, action: {id: str; data: idk}) => idk;
  };
  UseRestState: {
    id      : id;
    restore : (rest: ne) => ne;
    initial?: idk;
  };
  UseDialogRestState: {
    id     : id;
    restore: (rest: opt<RestEmbed>) => opt<RestEmbed>;
    open   : (embed: opt<RestEmbed>) => opt<RestText>;
    submit : (text: RestText) => opt<RestEmbed>;
  };
  UseLayoutDisable: {id: id};
  UseAsyncUpdate: {
    id    : id;
    update: () => E.Effect<Ev.Status, ne, ne>;
  };
  UseEffectReducer: {
    id     : id;
    initial: idk;
    restore: (rest: idk) => E.Effect<idk, ne, ne>;
    reduce : (state: idk, action: {id: str; data: idk}) => E.Effect<idk, ne, ne>;
  };
}>;
export const Sync = D.taggedEnum<SyncCall>();
export type Registry = SyncCall[];


export type UpdateCall = D.TaggedEnum<{
  SetState     : {id: str; next: idk};
  SetRestState : {id: str; next: idk};
  Action       : {id: str; action: {id: str; data: idk}};
  LayoutDisable: {id: str};
  LayoutEnable : {id: str};
  Effect       : {id: str};
  AsyncAction  : {id: str; action: {id: str; data: idk}};
  AsyncUpdate  : {id: str; next: Ev.Status};
  AsyncEffect  : {id: str};
}>;
export const Update = D.taggedEnum<UpdateCall>();
export type Updates = UpdateCall[];


export const filterRenderUpdates = (updates: Updates) => {
  const renderUpdates = [];
  for (const update of updates) {
    if (Update.$is('SetState')(update)) renderUpdates.push(update);
    if (Update.$is('SetRestState')(update)) renderUpdates.push(update);
    if (Update.$is('Action')(update)) renderUpdates.push(update);
  }
  return renderUpdates;
};


export const filterLayoutUpdates = (updates: Updates) => {
  const layoutUpdates = [];
  for (const update of updates) {
    if (Update.$is('LayoutDisable')(update)) layoutUpdates.push(update);
    if (Update.$is('LayoutEnable')(update)) layoutUpdates.push(update);
  }
  return layoutUpdates;
};


export const filterAsyncUpdates = (updates: Updates) => {
  const asyncUpdates = [];
  for (const update of updates) {
    if (Update.$is('AsyncAction')(update)) asyncUpdates.push(update);
    if (Update.$is('AsyncUpdate')(update)) asyncUpdates.push(update);
  }
  return asyncUpdates;
};


export const decodeHydrate = (search: URLSearchParams, hooks: SyncCall[]) => {
  for (const [key, value] of search.entries()) {
    const [tag, ...ids] = key.split('_');
    const id = ids.join('_');
    const [callStr] = id.split('_');
    const call = parseInt(callStr);

    // UseState
    if (tag === 's') {
      hooks[call] = Sync.State({id, data: {state: value}});
    }
  }
  return hooks;
};


export const hydrate = (hooks: SyncCall[], calls: UpdateCall[]) => {

};


const encode = Sync.$match({
  State             : (hk) => [hk.id, encodeURIComponent(JSON.stringify(hk.data.state))] as const,
  UseReducer        : () => null,
  UseRestState      : () => null,
  UseDialogRestState: () => null,
  UseLayoutDisable  : () => null,
  UseAsyncUpdate    : () => null,
  UseEffectReducer  : () => null,
});


export const encodeToSearch = (hooks: SyncCall[]) => {
  const search = new URLSearchParams();

  for (const hook of hooks) {
    const encoded = encode(hook);
    if (encoded === null) continue;
    const [encodedId, encodedState] = encoded;
    search.set(encodedId, encodedState);
  }

  return search;
};
