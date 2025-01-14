import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {type Hook, Tx} from '#src/internal/disreact/entity/index.ts';


let call_count = 0,
    calls      = [] as Hook.UpdateCall[],
    next_node  = '',
    next_close = false,
    next_defer = Tx.None;


export const getCount = () => call_count;


export const addCall = <A extends Hook.UpdateCall>(call: A) => {
  calls.push(call);
  call_count++;
  return call;
};


export const flushCalls = () => {
  // console.log(Unsafe.call_get(), 'flushing calls...');
  const temp = [...calls];
  calls = [];
  call_count = 0;
  return temp;
};


export const setNextNode = (n: string) => next_node = n;
export const setNextClose = (c: boolean) => next_close = c;
export const setNextDefer = (d: Tx.Defer) => next_defer = d;


export const flushNext = () => {
  // console.log(Unsafe.call_get(), 'flushing next node...');
  const temp = next_node;
  const temp2 = next_close;
  const temp3 = {...next_defer};
  next_node = '';
  next_close = false;
  next_defer = Tx.None;
  return {
    node_id: temp === '' ? NONE : temp,
    close  : temp2,
    defer  : temp3,
  };
};
