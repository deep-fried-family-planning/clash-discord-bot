/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import type {HookState} from '#src/disreact/model/hook-state.ts';
import {NONE, NONE_INT} from '#src/disreact/runtime/enum/index.ts';


export type NodeType =
  | PrimitiveNode
  | IntrinsicNode
  | RenderNode;


abstract class NodeStruct {
  public _tag       = '';
  public tag        = '';
  public props      = {} as Record<string, any>;
  public custom_id  = NONE;
  public index      = NONE_INT;
  public id         = NONE;
  public step_id    = NONE;
  public full_id    = NONE;
  public renderNode = null as unknown as RenderNode;
  public parentNode = null as null | NodeType;
  public childNodes = [] as NodeType[];
  public state      = null as HookState | null;

  public constructor(jsx: JSX.Element) {
    this.props = jsx.props;
    if ('custom_id' in jsx.props) {
      this.custom_id = `${jsx.props.custom_id}`;
    }
  }
}


export class PrimitiveNode extends NodeStruct {
  _tag = 'primitive' as const;
}


export class IntrinsicNode extends NodeStruct {
  _tag = 'intrinsic' as const;
}


export class RenderNode extends NodeStruct {
  _tag = 'function' as const;
  render: JSX.Func;

  public constructor(jsx: JSX.Element) {
    super(, props);
    this.render = tag;
  }
}
