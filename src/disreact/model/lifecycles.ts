import {Side} from '#src/disreact/model/entity/side.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {Props} from '#src/disreact/model/entity/props.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Relay, Progress} from '#src/disreact/model/Relay.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {E, ML, pipe, type RT} from '#src/disreact/utils/re-exports.ts';

export * as Lifecycles from '#src/disreact/model/lifecycles.ts';
export type Lifecycles = never;

const relayPartial = (elem: Elem.Rest) => E.flatMap(Relay, (relay) => {
  if (elem.type === 'modal') {
    return pipe(
      relay.sendStatus(
        Progress.Part({type: 'modal'}),
      ),
      E.as(true),
    );
  }
  if (elem.type === 'message') {
    const status = Progress.Part({
      type       : 'message',
      isEphemeral: elem.props.display === 'ephemeral' ? true : false,
    });

    return pipe(
      relay.sendStatus(status),
      E.as(true),
    );
  }
  return E.succeed(false);
});

const renderElemPiped = (root: Rehydrant, self: Elem.Task) => Dispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    E.flatMap(() => {
      Fibril.λ.set(self.fibril);
      self.fibril.rehydrant = root;
      self.fibril.pc = 0;
      self.fibril.elem = self;
      self.fibril.rehydrant.fibrils[self.id!] = self.fibril;
      return Elem.render(self);
    }),
    E.tap((children) => {
      Fibril.λ.clear();
      return E.as(dispatcher.unlock, children);
    }),
    E.catchAll((err) => {
      Fibril.λ.clear();
      return E.fail(err);
    }),
    E.catchAllDefect((err) => {
      Fibril.λ.clear();
      return E.die(err);
    }),
    E.map((children) => {
      self.fibril.pc = 0;
      self.fibril.saved = structuredClone(self.fibril.stack);
      self.fibril.rc++;

      const filtered = children.filter(Boolean) as Elem.Any[];

      for (let i = 0; i < filtered.length; i++) {
        const node = filtered[i];

        if (!Elem.isPrim(node)) {
          Elem.connectChild(self, node, i);
        }
      }

      return filtered;
    }),
    E.tap(() => renderEffectAtNodePiped(root, self)),
  ),
);


const renderEffectPiped = (root: Rehydrant, ef: Side) =>
  pipe(
    Side.apply(ef),
    E.tap(() => notifyPiped(root)),
  );

const renderEffectAtNodePiped = (root: Rehydrant, node: Elem.Task) => {
  if (!node.fibril.queue.length) {
    return E.void;
  }

  const effects = Array<RT<typeof renderEffectPiped>>(node.fibril.queue.length);
  for (let i = 0; i < effects.length; i++) {
    effects[i] = renderEffectPiped(root, node.fibril.queue[i]);
  }

  return E.all(effects).pipe(E.asVoid);
};


const notifyPiped = (root: Rehydrant) => E.flatMap(Relay, (relay) => {
  const curr = root;
  const next = root.next;

  if (next.id === null) {
    return pipe(
      relay.setOutput(null),
      E.flatMap(() => relay.sendStatus(
        Progress.Close()),
      ),
    );
  }

  if (next.id !== curr.id) {
    return pipe(
      E.flatMap(Registry, (registry) => registry.checkout(next.id!, next.props)),
      E.flatMap((next) => relay.setOutput(next)),
      E.flatMap(() => relay.sendStatus(
        Progress.Next({
          id   : next.id!,
          props: next.props,
        })),
      ),
    );
  }

  return E.void;
});


const notifyOnHandlePiped = (root: Rehydrant) => E.flatMap(Relay, (relay) => {
  const curr = root;
  const next = root.next;

  if (next.id === null) {
    return E.zip(
      relay.setOutput(null),
      relay.sendStatus(Progress.Close()),
    );
  }

  if (next.id !== curr.id) {
    return pipe(
      E.flatMap(Registry, (registry) => registry.checkout(next.id!, next.props)),
      E.flatMap((nextRoot) =>
        E.zip(
          relay.setOutput(nextRoot),
          relay.sendStatus(
            Progress.Next({
              id   : next.id!,
              props: next.props,
            }),
          ),
        ),
      ),
    );
  }

  return E.zip(
    relay.setOutput(root),
    relay.sendStatus(Progress.Same()),
  );
});

export const handleEvent = (root: Rehydrant, event: Trigger) => E.suspend(() => {
  const stack = ML.make<Elem>(root.elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isRest(elem)) {
      if (elem.props.custom_id === event.id || elem.ids === event.id) {
        return pipe(
          Trigger.apply(elem.handler, event),
          E.tap(() => notifyOnHandlePiped(root)),
        );
      }
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];
      if (!Elem.isPrim(node)) {
        ML.append(stack, elem.nodes[i]);
      }
    }
  }

  return E.fail(new Error('Event not handled'));
});


export const initialize = (root: Rehydrant) => initializeSubtree(root, root.elem);

const loopNodes = (stack: ML.MutableList<Elem>, root: Rehydrant, elem: Elem) => {
  for (let i = 0; i < elem.nodes.length; i++) {
    const node = elem.nodes[i];

    if (!Elem.isPrim(node)) {
      Elem.connectChild(elem, node, i);
      Rehydrant.mount(root, node);
      ML.append(stack, node);
    }
  }
  return stack;
};

export const initializeSubtree = (root: Rehydrant, elem: Elem) => {
  let hasSentPartial = false;

  return E.iterate(ML.make<Elem>(elem), {
    while: (stack) => !!ML.tail(stack),
    body : (stack) => {
      const elem = ML.pop(stack)!;

      if (Elem.isTask(elem)) {
        return pipe(
          renderElemPiped(root, elem),
          E.map((children) => {
            elem.nodes = children;
            return loopNodes(stack, root, elem);
          }),
        );
      }
      else if (!hasSentPartial) {
        return pipe(
          relayPartial(elem),
          E.map((did) => {
            hasSentPartial = did;
            return loopNodes(stack, root, elem);
          }),
        );
      }

      return E.succeed(loopNodes(stack, root, elem));
    },
  });
};

export const hydrate = (root: Rehydrant) =>
  E.iterate(ML.make<Elem>(root.elem), {
    while: (stack) => !!ML.tail(stack),
    body : (stack) => {
      const elem = ML.pop(stack)!;

      if (Elem.isTask(elem)) {
        if (root.fibrils[elem.id!]) {
          elem.fibril = root.fibrils[elem.id!];
          elem.fibril.rehydrant = root;
        }

        return pipe(
          renderElemPiped(root, elem),
          E.map((children) => {
            elem.nodes = children;
            return loopNodes(stack, root, elem);
          }),
        );
      }

      return E.succeed(loopNodes(stack, root, elem));
    },
  });


export const rerender = (root: Rehydrant) => E.gen(function* () {
  const stack = ML.empty<[Elem, Elem.Any[]]>();
  let hasSentPartial = false;

  if (Elem.isRest(root.elem)) {
    for (let i = 0; i < root.elem.nodes.length; i++) {
      const node = root.elem.nodes[i];

      if (Elem.isPrim(node)) {
        continue;
      }
      else if (Elem.isTask(node)) {
        ML.append(stack, [node, yield* renderElemPiped(root, node)]);
      }
      else {
        ML.append(stack, [node, node.nodes]);
      }
    }
  }
  else {
    ML.append(stack, [root.elem, yield* renderElemPiped(root, root.elem)]);
  }

  while (ML.tail(stack)) {
    const [parent, rs] = ML.pop(stack)!;
    const maxlen = Math.max(parent.nodes.length, rs.length);

    for (let i = 0; i < maxlen; i++) {
      const curr = parent.nodes[i];
      const rend = rs[i];

      if (!curr) {
        if (Elem.isPrim(rend)) {
          parent.nodes[i] = rend;
        }
        else {
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }
      else if (!rend) {
        if (Elem.isPrim(curr)) {
          delete parent.nodes[i];
        }
        else {
          dismountSubtree(root, curr);
          delete parent.nodes[i];
        }
      }

      else if (Elem.isPrim(curr)) {
        if (Elem.isPrim(rend)) {
          if (curr !== rend) {
            parent.nodes[i] = rend;
          }
        }
        else if (Elem.isRest(rend)) {
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
        else {
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }

      else if (Elem.isRest(curr)) {
        if (!hasSentPartial) {
          hasSentPartial = yield* relayPartial(curr);
        }

        if (Elem.isPrim(rend)) {
          dismountSubtree(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend)) {
          if (curr.type !== rend.type) {
            dismountSubtree(root, curr);
            yield* mountSubtree(root, rend);
            parent.nodes[i] = rend;
          }
          if (!Props.isEqual(curr.props, rend.props)) {
            curr.props = rend.props;
          }
          ML.append(stack, [curr, rend.nodes]);
        }
        else {
          dismountSubtree(root, curr);
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }

      else {
        if (Elem.isPrim(rend)) { // Task => Primitive
          dismountSubtree(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend) || curr.idn !== rend.idn) { // Task => Rest or Task => Task
          dismountSubtree(root, curr);
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
        else if (
          Props.isEqual(curr.props, rend.props) && // Task Changed
          Fibril.isSameStrand(curr.fibril)
        ) {
          ML.append(stack, [curr, rend.nodes]);
        }
        else {
          const rerendered = yield* renderElemPiped(root, curr);
          ML.append(stack, [curr, rerendered]);
        }
      }
    }
  }

  return root;
});


export const mountSubtree = (root: Rehydrant, elem: Elem) => E.gen(function* () {
  const stack = ML.make<Elem>(elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isTask(elem)) {
      Rehydrant.mountTask(root, elem);
      elem.nodes = yield* renderElemPiped(root, elem);
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];

      if (!Elem.isPrim(node)) {
        ML.append(stack, node);
      }
    }
  }
});

export const dismountSubtree = (root: Rehydrant, elem: Elem) => {
  const stack = ML.make<Elem>(elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isTask(elem)) {
      Rehydrant.dismountTask(root, elem);
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];

      if (!Elem.isPrim(node)) {
        ML.append(stack, node);
      }
    }
  }
};
