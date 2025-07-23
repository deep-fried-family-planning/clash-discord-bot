import * as GlobalValue from 'effect/GlobalValue';

const registry = GlobalValue.globalValue(Symbol.for('disreact/registry'), () => new Map<string, any>());

export const register = () => {

};

export const lookup = () => {

};
