import {dual} from 'effect/Function';

export namespace Root {
  export type Any = Root<any>;
  export type Value<A> = A extends Root<infer B> ? B : never;
}

export interface Root<A> {
  root: A | undefined;
}

export const getRoot = <A extends Root.Any>(self: A): A | undefined => self.root;

export const setRoot = dual<
  <A extends Root.Any>(root?: Root.Value<A>) => (self: A) => A,
  <A extends Root.Any>(self: A, root?: Root.Value<A>) => A
>(2, (self, root) => {
  self.root = root;
  return self;
});

export namespace Origin {
  export type Any = Origin<any>;
  export type Value<A> = A extends Origin<infer B> ? B : never;
}

export interface Origin<A> {
  origin: A | undefined;
}

export const getOrigin = <A extends Origin.Any>(self: A): A | undefined => self.origin;

export const setOrigin = dual<
  <A extends Origin.Any>(origin?: Origin.Value<A>) => (self: A) => A,
  <A extends Origin.Any>(self: A, origin?: Origin.Value<A>) => A
>(2, (self, origin) => {
  self.origin = origin;
  return self;
});

export const disposeOrigin = <A extends Origin.Any>(self: A): A => {
  self.origin = undefined;
  return self;
};

export namespace Ancestor {
  export type Any = Ancestor<any>;
  export type Value<A> = A extends Ancestor<infer B> ? B : never;
}

export interface Ancestor<A extends Ancestor<any>> {
  ancestor: A | undefined;
}

export const getAncestor = <A extends Ancestor.Any>(self: A): A | undefined => self.ancestor;

export const setAncestor = dual<
  <A extends Ancestor.Any>(ancestor: Ancestor.Value<A>) => (self: A) => A,
  <A extends Ancestor.Any>(self: A, ancestor: Ancestor.Value<A>) => A
>(2, (self, ancestor) => {
  self.ancestor = ancestor;
  return self;
});

export const disposeAncestor = <A extends Ancestor.Any>(self: A): A => {
  self.ancestor = undefined;
  return self;
};

export const getRootAncestor = <A extends Ancestor.Any>(node: A): A => {
  let a = node;
  while (a.ancestor) {
    a = a.ancestor;
  }
  return a;
};

export const getAncestryList = <A extends Ancestor.Any>(node: A): A[] => {
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

export const findLowestCommonAncestor = <A extends Ancestor.Any>(iter: Iterable<A>): A | undefined => {
  const nodes = [...iter];

  if (!nodes?.length) {
    return undefined;
  }
  if (nodes.length === 1) {
    return nodes[0];
  }
  let lca = nodes[0];
  const as = new Set<A>(getAncestryList(lca));

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

export namespace Descendent {
  export type Any = Descendent<any>;
  export type Value<A> = A extends Descendent<infer B> ? B : never;
}
export type Descendent<A extends Descendent.Any> = {
  children?: undefined | A[];
};

export const getChildren = <A extends Descendent.Any>(self: A): A[] | undefined => self.children;

export const setChildren = dual<
  <A extends Descendent.Any>(children?: A[]) => (self: A) => A,
  <A extends Descendent.Any>(self: A, children?: A[]) => A
>(2, (self, children) => {
  self.children = children;
  return self;
});

export const disposeChildren = <A extends Descendent.Any>(self: A): A => {
  self.children = undefined;
  return self;
};

export const childrenTraversal = <A extends Descendent.Any>(start: A): A[] =>
  start.children
  ?? [];

export const reverseChildrenTraversal = <A extends Descendent.Any>(start: A): A[] =>
  start.children?.toReversed()
  ?? [];

export const toReversedChildren = <A extends Descendent.Any>(self: A): A[] | undefined =>
  self.children?.toReversed();

export const forEachDescendent = <A extends Descendent.Any>(self: A, f: (self: A) => void) => {};

export const preOrderTraversal = <A extends Descendent.Any>(start: A): A[] =>
  [
    ...reverseChildrenTraversal(start),
    start,
  ];

export const preOrderEntire = <A extends Descendent.Any>(start: A): A[] => {
  const stack = [start];
  const traversal = [] as A[];

  while (stack.length > 0) {
    const cur = stack.pop()!;
    traversal.push(cur);

    if (!cur.children) {
      continue;
    }
    for (let i = cur.children.length - 1; i >= 0; i--) {
      stack.push(cur.children[i]);
    }
  }
  return traversal;
};

export const postOrderTraversal = <A extends Descendent.Any>(start: A): A[] =>
  [
    start,
    ...reverseChildrenTraversal(start),
  ];

export const postOrderEntire = <A extends Descendent.Any>(start: A): A[] => {
  const stack = [start];
  const visited = new WeakSet();
  const traversal = [] as A[];

  while (stack.length > 0) {
    const cur = stack.pop()!;

    if (visited.has(cur)) {
      traversal.push(cur);
      continue;
    }
    visited.add(cur);
    stack.push(cur);
    if (!cur.children) {
      continue;
    }
    for (let i = cur.children.length - 1; i >= 0; i--) {
      stack.push(cur.children[i]);
    }
  }
  return traversal;
};

export const levelOrder = <A extends Descendent.Any>(start: A) => {
  const queue = [start];
  const traversal = [] as A[];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    traversal.push(cur);

    if (!cur.children) {
      continue;
    }
    for (let i = 0; i < cur.children.length; i++) {
      queue.push(cur.children[i]);
    }
  }
};

export namespace Sibling {
  export type Any = Sibling<any>;
  export type Value<A> = A extends Sibling<infer B> ? B : never;
}

export interface Sibling<A extends Sibling.Any> {
  head: A | undefined;
  tail: A | undefined;
}

export const getHead = <A extends Sibling.Any>(self: A): A | undefined => self.head;

export const getTail = <A extends Sibling.Any>(self: A): A | undefined => self.tail;

export const setHead = dual<
  <A extends Sibling.Any>(head?: A) => (self: A) => A,
  <A extends Sibling.Any>(self: A, head?: A) => A
>(2, (self, head) => {
  self.head = head;
  return self;
});

export const setTail = dual<
  <A extends Sibling.Any>(tail?: A) => (self: A) => A,
  <A extends Sibling.Any>(self: A, tail?: A) => A
>(2, (self, tail) => {
  self.tail = tail;
  return self;
});

export const appendSibling = <A extends Sibling.Any>(tail: A, head?: A) => {
  if (head) {
    head.tail = tail;
    tail.head = head;
  }
  return tail;
};

export const prependSibling = <A extends Sibling.Any>(head: A, tail?: A) => {
  if (tail) {
    tail.head = head;
    head.tail = tail;
  }
  return head;
};

export const siblingOrder = <A extends Sibling.Any>(node: A): A[] => {
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

export const replace = <A extends Sibling.Any>(node: A, replacement: A): A => {
  throw new Error();
};

export const remove = <A extends Sibling.Any>(node: A): A => {
  throw new Error();
};

export const insertAfter = <A extends Sibling.Any>(node: A, after: A): A => {
  if (!node.tail) {
    node.tail = after;
    after.head = node;
    return after;
  }
  const tail = node.tail;
  node.tail = after;
  after.head = node;
  tail.tail = after;
  throw new Error();
};

export const insertBefore = <A extends Sibling.Any>(node: A, before: A): A => {
  if (!node.head) {
    node.head = before;
    before.tail = node;
    return before;
  }
  const head = node.head;
  node.head = before;
  throw new Error();
};

export interface Key {
  type : any;
  trie : string;
  step : string;
  index: number;
  depth: number;
}

export const coordinateKey = (self: Key, that: Key) =>
  `${self.depth}:${self.index}`;

export const toPrefixKey = <A extends Key>(self: A) =>
  `${self.type}:${self.depth}:${self.index}`;

export const toTrieKey = <A extends Key>(p: A, c: A) =>
  `${p.trie}:${toPrefixKey(c)}`;

export const toStepKey = <A extends Key>(p: A, c: A) =>
  `${toPrefixKey(p)}:${toPrefixKey(c)}`;

export const setRootKey = dual<
  <A extends Key>(name?: string) => (self: A) => A,
  <A extends Key>(self: A, name?: string) => A
>(2, (self, name?) => {
  self.trie = '0';
  self.step = '0';
  return self;
});

export const nestTrieKey = dual<
  <A extends Key>(that: A) => (self: A) => A,
  <A extends Key>(self: A, that: A) => A
>(2, (self, that) => {
  self.trie = `${that.trie}:${self.index}`;
  return self;
});

export const nestKey = dual<
  <A extends Key>(that: A) => (self: A) => A,
  <A extends Key>(self: A, that: A) => A
>(2, (self, that) => {
  self.trie = `${that.trie}:${self.index}`;
  self.step = `${that.type}:${that.index}:${self.type}:${self.index}`;
  return self;
});
