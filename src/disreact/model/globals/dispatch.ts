

export const make = () => ({});

export type Type = ReturnType<typeof make>;



const dispatch = {current: null};



export const current = () => {
  return dispatch.current;
};
