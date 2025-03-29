export * as Elemtree from 'src/disreact/model/entity/ETree.ts'
export type ETree<A, B> = CRoot<A, B>

export type CRoot<A, B> = {
  _: 0
  e: (CNode<A, B> | CLeaf<A, B>)[]
  v: A
}
export type CNode<A, B> = {
  _: 1
  r: CRoot<A, B>
  u: CNode<A, B>
  n: CNode<A, B> | CLeaf<A, B>
  e: (CNode<A, B> | CLeaf<A, B>)[]
  v: A
}
export type CLeaf<A, B> = {
  _: 2
  r: CRoot<A, B>
  u: CNode<A, B>
  v: A | B
}
