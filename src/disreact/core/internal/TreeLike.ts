export interface Ancestor<A extends Ancestor<any>> {
  ancestor: A | undefined;
}

export const root = <A extends Ancestor<any>>(node: A): A | undefined => {
  let a = node.ancestor;
  while (a) {
    if (a.parent) {
      a = a.parent;
    }
  }
  return a;
};

export const ancestry = <A extends Ancestor<any>>(node: A): A[] => {
  const as = [node];
  let a = node.ancestor;
  while (a) {
    as.push(a);
    a = a.parent;
  }
  return as;
};

export type Descendent<A extends Descendent<any, B>, B extends string = 'children'> = {
  [k in B]: A[] | undefined;
};

export const dfs = <A extends Descendent<any>>(node: A) => {
  const stack = [node];
  const visited = new Set<A>();
  while (stack.length > 0) {
    const n = stack.pop()!;
    if (visited.has(n)) {
      continue;
    }
    visited.add(n);
    stack.push(...n.children ?? []);
  }
};

export const bfs = <A extends Descendent<any>>(node: A) => {
  const queue = [node];
  const visited = new Set<A>();
  while (queue.length > 0) {
    const n = queue.shift()!;
    if (visited.has(n)) {
      continue;
    }
    visited.add(n);
    queue.push(...n.children ?? []);
  }
};

export interface Sibling<A extends Sibling<any>> {
  head: A | undefined;
  tail: A | undefined;
}

export const adjacency = <A extends Sibling<any>>(node: A): A[] => {
  const as = [node];
  let current = node.head;
  while (current) {
    as.unshift(current);
    current = current.head;
  }
  current = node.tail;
  while (current) {
    as.push(current);
    current = current.tail;
  }
  return as;
};
