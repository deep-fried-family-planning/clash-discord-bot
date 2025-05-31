import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';

const TestLayer = Rehydrator.Default({
  sources: {

  },
});

export const sjson = (o: any) => JSON.stringify(o, null, 2);
