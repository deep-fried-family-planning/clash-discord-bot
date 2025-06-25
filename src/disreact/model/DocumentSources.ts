import * as E from 'effect/Effect';

export class DocumentSources extends E.Service<DocumentSources>()('disreact/DocumentSources', {
  effect: E.fnUntraced(function* () {
    return {};
  }),
  accessors: true,
})
{}
