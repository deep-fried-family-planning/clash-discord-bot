import {Kv, pipe} from '#pure/effect';
import {type Nd, Un} from '#src/internal/disreact/virtual/entities/index.ts';


export const useNext = (nodes: Nd.KeyedFns) => {
  Un.setNodes(nodes);

  const updater = (next: keyof typeof nodes) => {
    Un.setNextNode(next);
  };

  const nodeNames = pipe(
    nodes,
    Kv.mapEntries((_, k) => [k, k]),
  ) as {[k in keyof typeof nodes]: k};

  return [nodeNames, updater] as const;
};
