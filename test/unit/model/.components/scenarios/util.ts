import {Rehydrator} from '#src/internal/a/adaptor/Rehydrator.ts';
import {ButtonEffect} from '#unit/components/button-effect.tsx';

const TestLayer = Rehydrator.Default({
  sources: {

  },
});

export const sjson = (o: any) => JSON.stringify(o, null, 2);
