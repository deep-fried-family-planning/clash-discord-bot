export type Start = {
  _tag: 'Start';
};

export type Close = {
  _tag: 'Close';
};

export type Next = {
  _tag: 'Next';
};

export type Same = {
  _tag: 'Same';
};

export type Point = {
  _tag: 'Point';
};

export type End = {
  _tag: 'End';
};

export type Check = | Start
                    | Close
                    | Next
                    | Same
                    | Point
                    | End;

export const start = (): Start => ({
  _tag: 'Start',
});

export const close = (): Close => ({
  _tag: 'Close',
});

export const next = (): Next => ({
  _tag: 'Next',
});

export const same = (): Same => ({
  _tag: 'Same',
});

export const point = (): Point => ({
  _tag: 'Point',
});

export const end = (): End => ({
  _tag: 'End',
});
