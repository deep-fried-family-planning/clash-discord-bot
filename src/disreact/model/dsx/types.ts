/* eslint-disable @typescript-eslint/no-explicit-any */


export type TagFunc = (props: any) => any;


export type TagTypes
  = string
  | null
  | undefined
  | TagFunc;


export type SharedAttributes = {
  _key?: string;
};
