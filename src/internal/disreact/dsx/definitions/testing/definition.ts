/* eslint-disable @typescript-eslint/no-unused-vars */

import {ProgramCounter} from '#disreact/dsx/definitions/extrinsic/ProgramCounter.ts';
import {typeInfo} from '#disreact/dsx/definitions/types.ts';
import type {ne, str, und} from '#src/internal/pure/types-pure.ts';



type DSXType =
  | str
  | und
  | ((props: ne) => ne);


export class DisReactNode<
  A,
  B = ne,
> {
  private self : A;
  private nodes: DisReactNode<B>[];

  constructor(self: A) {
    this.self  = self;
    this.nodes = [];
  }

  public addNode(node: DisReactNode<B>) {
    this.nodes.push(node);
  }

  public render(props) {

  }
}



// class extends typeInfo<Tag, Type, Props, Children, Element, Meta, In, Out>() {
//   public static encodeElement = encodeElement!;
//   public static decodeElement = decodeElement!;
//   public static _tag          = typeof tag === 'function' ? 'function' : tag;
//
//
//   private type     = type;
//   private renderer = type === 'function' ? (props) => jsx(tag, props) : null;
//
//   private tag     : Tag;
//   private key     : str;
//   private hooks   : DrGlobals.HookState;
//   private element : Element;
//   private renderer: () => ne;
//   private params  : rec<str>;
//   private children: Children;
//   private props   : Props;
//   private nodes   : this[];
//
//   private constructor(
//     t: Tag,
//     i: Element,
//     r: () => ne,
//   ) {
//     super();
//     this.nodes    = [];
//     this.hooks    = DrGlobals.makeEmptyRef();
//     this.renderer = r;
//     this.tag      = t;
//   }
//
//   static createElement = (t: Tag, p: Props, c: Children, meta?: DisReact.MetaAttribute) => {
//
//   };
//
//   public render(props) {
//     if (typeof this.tag === 'function') {
//       DrGlobals.setActiveNode(this);
//
//       const element = jsx(this.tag, props);
//     }
//
//     for (let i = 0; i < this.nodes.length; i++) {
//       const node    = this.nodes[i];
//       this.nodes[i] = node.render();
//     }
//
//
//     DrGlobals.setActiveNode(this);
//
//     for (const node of this.nodes) {
//
//     }
//     return this;
//   }
//
//
//   // public mount() {
//   //   this.active = true;
//   //   return DrGlobals.mountRef(this);
//   // }
//   //
//   // public render(t: Type, p: Props, c: Children) {
//   //   if (!this.active) throw new Error('render called on inactive fiber');
//   //   this
//   //   this.rc.inc();
//   //   this.current = definition.createElement(t, p, c);
//   //   return this.current;
//   // }
//   //
//   // public dismount() {
//   //   this.active = false;
//   //   return DrGlobals.dismountRef(this);
//   // }
// };
