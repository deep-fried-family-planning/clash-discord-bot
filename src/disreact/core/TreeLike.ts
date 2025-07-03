export interface Root<A> {
  root: A | undefined;
}

export interface Ancestor<A extends Ancestor<any>> {
  ancestor: A | undefined;
}

export const ancestryRoot = <A extends Ancestor<any>>(node: A): A | undefined => {
  let a = node.ancestor;
  while (a.ancestor) {
    a = a.ancestor;
  }
  return a;
};

export const ancestryList = <A extends Ancestor<any>>(node?: A): A[] => {
  if (!node) {
    return [];
  }
  const as = [node];
  let a = node.ancestor;
  while (a) {
    as.push(a);
    a = a.ancestor;
  }
  return as;
};

export const lowestCommonAncestor = <A extends Ancestor<any>>(nodes?: A[]): A | undefined => {
  if (!nodes?.length) {
    return undefined;
  }
  if (nodes.length === 1) {
    return nodes[0];
  }
  let lca = nodes.at(0);
  const as = new Set<A>(ancestryList(lca));

  for (let i = 1; i < nodes.length; i++) {
    let a = nodes.at(i);

    while (a) {
      if (as.has(a)) {
        lca = a;
        break;
      }
      a = a.ancestor;
    }
  }
  return lca;
};

// export type Descendent<A extends Descendent<any, B>, B extends string = 'children'> = {
//   [k in B]: A[] | undefined;
// };

export type Descendent<A extends Descendent<any>> = {
  children: undefined | A[];
};

export const dfsPreOrder = <A extends Descendent<any>>(start: A): A[] => {
  const ts = [start];
  const ds = [] as A[];

  while (ts.length > 0) {
    const n = ts.pop()!;
    ds.push(n);

    if (!n.children) {
      continue;
    }
    for (let i = n.children.length - 1; i >= 0; i--) {
      ts.push(n.children[i]);
    }
  }
  return ds;
};

export const dfsPostOrder = <A extends Descendent<any>>(start: A): A[] => {
  const ts = [start];
  const vs = new WeakSet();
  const ds = [] as A[];

  while (ts.length > 0) {
    const n = ts.pop()!;

    if (vs.has(n)) {
      ds.push(n);
      continue;
    }
    vs.add(n);
    ts.push(n);
    if (!n.children) {
      continue;
    }
    for (let i = n.children.length - 1; i >= 0; i--) {
      ts.push(n.children[i]);
    }
  }
  return ds;
};

export const bfs = <A extends Descendent<any>>(start: A) => {
  const qs = [start];
  const vs = new Set<A>();
  while (qs.length > 0) {
    const node = qs.shift()!;
    if (vs.has(node)) {
      continue;
    }
    vs.add(node);
    qs.push(...node.children ?? []);
  }
};

export interface Sibling<A extends Sibling<any>> {
  head: A | undefined;
  tail: A | undefined;
}

export const adjacencyList = <A extends Sibling<any>>(node: A): A[] => {
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

export const replace = <A extends Sibling<any>>(node: A, replacement: A): A => {

};

export const remove = <A extends Sibling<any>>(node: A): A => {
  if (!node.head) {
    return node;
  }
};

export const insertAfter = <A extends Sibling<any>>(node: A, after: A): A => {
  if (!node.tail) {
    node.tail = after;
    after.head = node;
    return after;
  }
  const tail = node.tail;
  node.tail = after;
  after.head = node;
  tail.tail = after;
};

export const insertBefore = <A extends Sibling<any>>(node: A, before: A): A => {
  if (!node.head) {
    node.head = before;
    before.tail = node;
    return before;
  }
  const head = node.head;
  node.head = before;
};

export interface Meta {
  trie   : string;
  step   : string;
  index  : number;
  height : number;
  depth  : number;
  valence: number;
  source?: any;
  self?  : any;
}

export const trie = <A extends Meta>(self: A) => `${self.trie}`;

export const step = <A extends Meta>(self: A) => `${self.step}`;
