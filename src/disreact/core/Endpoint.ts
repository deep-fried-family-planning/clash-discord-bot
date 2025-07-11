import type * as FC from '#disreact/core/FC.ts';
import type * as Element from '#disreact/core/Element.ts';
import {globalValue} from 'effect/GlobalValue';
import type * as Inspectable from 'effect/Inspectable';

export interface Endpoint extends Inspectable.Inspectable {
  id       : string;
  component: any;
}

const endpoints = globalValue(Symbol.for('disreact/endpoints'), () => new Map<string, Endpoint>());

export const fromElement = (element: Element.Element): Endpoint => {

};

export const fromFC = (id: string, component: FC.FC) => {

};
