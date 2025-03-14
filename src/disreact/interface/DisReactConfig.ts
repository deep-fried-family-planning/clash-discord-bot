import {E} from '#src/internal/pure/effect.ts';



export class TemplateCodec extends E.Service<TemplateCodec>()('disreact/TemplateCodec', {
  succeed: {
    baseUrl: 'https://dffp.org',
  },
  accessors: true,
}) {}
