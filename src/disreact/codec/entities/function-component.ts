export type Type = {
  (props: any): any;
  displayName?: string;
  isRoot?     : boolean;
  isModal?    : boolean;
  isSync?     : boolean;
  isEffect?   : boolean;
};
