import type * as Inspectable from 'effect/Inspectable';

export type Outcome = | Close
                      | Update
                      | Open
                      | Replace;

export type Update = {
  _tag: 'Update';
};

export type Replace = {
  _tag: 'Replace';
};

export type Open = {
  _tag: 'Open';
};

export type Close = {
  _tag: 'Close';
};
